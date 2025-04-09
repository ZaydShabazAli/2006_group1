from fastapi import APIRouter
from pydantic import BaseModel
from utils.sms_utils import send_sms

router = APIRouter()

class SMSRequest(BaseModel):
    to: str
    message: str

@router.post("/api/send-sms")
def send_sms_endpoint(request: SMSRequest):
    result = send_sms(request.to, request.message)
    return {"result": result}
