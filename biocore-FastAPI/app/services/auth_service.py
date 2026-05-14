from jose import JWTError
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.user import User
from app.models.token import RefreshToken
from app.models.base import BaseModel
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse, TokenResponse
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from app.utils.exceptions import UnauthorizedException, BadRequestException


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, request: RegisterRequest) -> AuthResponse:
        existing = self.db.query(User).filter(User.email == request.email).first()
        if existing:
            raise BadRequestException(detail="Email already registered")

        user = User(
            id=BaseModel.generate_id("usr"),
            email=request.email,
            hashed_password=hash_password(request.password),
            name=request.name,
            institution=request.institution
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})
        self._save_refresh_token(user.id, refresh_token)

        return AuthResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            token=token,
            refreshToken=refresh_token
        )

    def login(self, request: LoginRequest) -> AuthResponse:
        user = self.db.query(User).filter(User.email == request.email).first()
        if not user or not verify_password(request.password, user.hashed_password):
            raise UnauthorizedException(detail="Invalid credentials")

        token = create_access_token({"sub": user.id})
        refresh_token = create_refresh_token({"sub": user.id})
        self._save_refresh_token(user.id, refresh_token)

        return AuthResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            token=token,
            refreshToken=refresh_token
        )

    def logout(self, user_id: str):
        self.db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked == False
        ).update({"revoked": True})
        self.db.commit()

    def refresh(self, refresh_token: str) -> TokenResponse:
        try:
            payload = verify_token(refresh_token, "refresh")
        except JWTError:
            raise UnauthorizedException(detail="Invalid refresh token")

        stored_token = self.db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token,
            RefreshToken.revoked == False
        ).first()
        if not stored_token:
            raise UnauthorizedException(detail="Refresh token revoked")

        new_access_token = create_access_token({"sub": stored_token.user_id})
        new_refresh_token = create_refresh_token({"sub": stored_token.user_id})

        stored_token.revoked = True
        self._save_refresh_token(stored_token.user_id, new_refresh_token)

        return TokenResponse(token=new_access_token, refreshToken=new_refresh_token)

    def _save_refresh_token(self, user_id: str, token: str):
        rt = RefreshToken(
            id=BaseModel.generate_id("rft"),
            user_id=user_id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        self.db.add(rt)
        self.db.commit()