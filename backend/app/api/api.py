from fastapi import APIRouter
from .endpoints import device, user, device_type, purchase, assignment, reports

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(device_type.router, prefix="/device-types", tags=["device types"])
api_router.include_router(user.router, prefix="/users", tags=["users"])
api_router.include_router(device.router, prefix="/devices", tags=["devices"])
api_router.include_router(purchase.router, prefix="/purchases", tags=["purchases"])
api_router.include_router(assignment.router, prefix="/assignments", tags=["assignments"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])