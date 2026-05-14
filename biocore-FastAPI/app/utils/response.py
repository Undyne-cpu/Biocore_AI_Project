from typing import TypeVar, Generic

T = TypeVar("T")


def success_response(data: T = None, message: str = None) -> dict:
    return {"code": 200, "message": message, "data": data}


def error_response(code: int, message: str) -> dict:
    return {"code": code, "message": message, "data": None}