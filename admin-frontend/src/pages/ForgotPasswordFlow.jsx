import React, { useState } from "react";
import ForgotPassword from "./ForgotPassword";
import OTPVerify from "./OTPVerify";
import ResetPassword from "./ResetPassword";


function ForgotPasswordFlow() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-20">
      {step === 1 && <ForgotPassword setStep={setStep} setEmail={setEmail} />}
      {step === 2 && <OTPVerify email={email} setStep={setStep} />}
      {step === 3 && <ResetPassword email={email} setStep={setStep} />}
    </div>
  );
}

export default ForgotPasswordFlow;
