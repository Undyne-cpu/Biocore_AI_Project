from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")


class BaseResponse(BaseModel, Generic[T]):
    code: int = 200
    message: Optional[str] = None
    data: Optional[T] = None


class PaginatedData(BaseModel, Generic[T]):
    list: list[T]
    total: int
    page: int
    pageSize: int


class PaginationParams(BaseModel):
    page: int = 1
    pageSize: int = 20

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.pageSize