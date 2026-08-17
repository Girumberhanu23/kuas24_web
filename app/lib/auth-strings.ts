"use client";

import { useLocale } from "./locale";

export interface AuthStrings {
  login: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    requiredPhone: string;
    passwordLength: string;
    loginSuccessIncomplete: string;
    loginError: string;
    submitting: string;
    button: string;
    forgotPassword: string;
    createAccount: string;
  };
  register: {
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    nameLength: string;
    requiredPhone: string;
    passwordLength: string;
    registrationIncomplete: string;
    registering: string;
    button: string;
    alreadyHaveAccount: string;
    login: string;
  };
  forgot: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    requiredPhone: string;
    otpError: string;
    submitting: string;
    button: string;
    backTo: string;
    login: string;
  };
  reset: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    requiredPhone: string;
    requiredCode: string;
    passwordLength: string;
    resetError: string;
    submitting: string;
    button: string;
    returnTo: string;
    login: string;
  };
  verify: {
    title: string;
    subtitle: string;
    phoneLabel: string;
    phonePlaceholder: string;
    codeLabel: string;
    codePlaceholder: string;
    requiredPhone: string;
    requiredCode: string;
    verifying: string;
    button: string;
    returnText: string;
    forgotPassword: string;
  };
}

const en: AuthStrings = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to continue to your personalized football feed.",
    phoneLabel: "Phone Number",
    phonePlaceholder: "09XXXXXXXX",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    requiredPhone: "Phone number is required.",
    passwordLength: "Password must be at least 4 characters.",
    loginSuccessIncomplete: "Login succeeded but session data is incomplete.",
    loginError: "Unable to log in.",
    submitting: "Logging in...",
    button: "Login",
    forgotPassword: "Forgot password?",
    createAccount: "Create account",
  },
  register: {
    title: "Create your account",
    subtitle: "Join Kuas24 to get personalized fixtures and sports updates.",
    nameLabel: "Name",
    namePlaceholder: "Your full name",
    phoneLabel: "Phone Number",
    phonePlaceholder: "09XXXXXXXX",
    passwordLabel: "Password",
    passwordPlaceholder: "Create a password",
    nameLength: "Name must be at least 2 characters.",
    requiredPhone: "Phone number is required.",
    passwordLength: "Password must be at least 4 characters.",
    registrationIncomplete: "Registration succeeded but session data is incomplete.",
    registering: "Creating account...",
    button: "Register",
    alreadyHaveAccount: "Already have an account?",
    login: "Login",
  },
  forgot: {
    title: "Forgot password",
    subtitle: "Enter your phone number and we will send an OTP code.",
    phoneLabel: "Phone Number",
    phonePlaceholder: "09XXXXXXXX",
    requiredPhone: "Phone number is required.",
    otpError: "Unable to send OTP right now.",
    submitting: "Sending OTP...",
    button: "Send OTP",
    backTo: "Back to",
    login: "Login",
  },
  reset: {
    title: "Reset password",
    subtitle: "Create a new password for your account.",
    phoneLabel: "Phone Number",
    phonePlaceholder: "09XXXXXXXX",
    codeLabel: "Verification Code",
    codePlaceholder: "OTP code",
    passwordLabel: "New Password",
    passwordPlaceholder: "At least 8 characters",
    requiredPhone: "Phone number is required.",
    requiredCode: "Verification code is required.",
    passwordLength: "New password must be at least 8 characters.",
    resetError: "Unable to reset password right now.",
    submitting: "Updating password...",
    button: "Reset Password",
    returnTo: "Return to",
    login: "Login",
  },
  verify: {
    title: "Verify OTP",
    subtitle: "Enter the verification code sent to your phone.",
    phoneLabel: "Phone Number",
    phonePlaceholder: "09XXXXXXXX",
    codeLabel: "OTP Code",
    codePlaceholder: "6-digit code",
    requiredPhone: "Phone number is required.",
    requiredCode: "OTP code is required.",
    verifying: "Verifying...",
    button: "Verify OTP",
    returnText: "Didn’t receive code? Return to",
    forgotPassword: "Forgot Password",
  },
};

const am: AuthStrings = {
  login: {
    title: "እንኳን በደህና መጡ",
    subtitle: "የራስዎን የእግር ኳስ ማውጫ ለመቀጠል ግቡ።",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "09XXXXXXXX",
    passwordLabel: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃልዎን ያስገቡ",
    requiredPhone: "ስልክ ቁጥር ያስፈልጋል።",
    passwordLength: "የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት።",
    loginSuccessIncomplete: "መግቢያ ተሳክቷል ነገር ግን የክፍለ ጊዜ መረጃ አልተሟላም።",
    loginError: "ግባ አልተቻለም።",
    submitting: "በመግባት ላይ...",
    button: "ግባ",
    forgotPassword: "የይለፍ ቃል ረሱ?",
    createAccount: "መለያ ፍጠር",
  },
  register: {
    title: "መለያዎን ፍጠሩ",
    subtitle: "ከKuas24 ጋር ተቀላቀሉ እና የተለየ ፋይትስ ዜና እና ዝመናዎች ያግኙ።",
    nameLabel: "ስም",
    namePlaceholder: "ሙሉ ስምዎ",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "09XXXXXXXX",
    passwordLabel: "የይለፍ ቃል",
    passwordPlaceholder: "የይለፍ ቃል ይፍጠሩ",
    nameLength: "ስም ቢያንስ 2 ቁምፊ መሆን አለበት።",
    requiredPhone: "ስልክ ቁጥር ያስፈልጋል።",
    passwordLength: "የይለፍ ቃል ቢያንስ 4 ቁምፊ መሆን አለበት።",
    registrationIncomplete: "ምዝገባ ተሳክቷል ነገር ግን የክፍለ ጊዜ መረጃ አልተሟላም።",
    registering: "መለያ በመፍጠር ላይ...",
    button: "መለያ ፍጠር",
    alreadyHaveAccount: "አስቀድሞ መለያ አለዎት?",
    login: "ግባ",
  },
  forgot: {
    title: "የይለፍ ቃል ረሳሽ",
    subtitle: "ስልክ ቁጥርዎን ያስገቡ እና OTP ኮድ እንልክሎታለ።",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "09XXXXXXXX",
    requiredPhone: "ስልክ ቁጥር ያስፈልጋል።",
    otpError: "OTP አሁን መላክ አልተቻለም።",
    submitting: "OTP በመላክ ላይ...",
    button: "OTP ላክ",
    backTo: "ተመለስ ወደ",
    login: "ግባ",
  },
  reset: {
    title: "የይለፍ ቃል ዳግም አስጀምር",
    subtitle: "ለመለያዎ አዲስ የይለፍ ቃል ይፍጠሩ።",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "09XXXXXXXX",
    codeLabel: "ማረጋገጫ ኮድ",
    codePlaceholder: "OTP ኮድ",
    passwordLabel: "አዲስ የይለፍ ቃል",
    passwordPlaceholder: "ቢያንስ 8 ቁምፊ",
    requiredPhone: "ስልክ ቁጥር ያስፈልጋል።",
    requiredCode: "የማረጋገጫ ኮድ ያስፈልጋል።",
    passwordLength: "አዲስ የይለፍ ቃል ቢያንስ 8 ቁምፊ መሆን አለበት።",
    resetError: "የይለፍ ቃል አሁን መለወጥ አይቻልም።",
    submitting: "የይለፍ ቃል በመቀየር ላይ...",
    button: "የይለፍ ቃል ዳግም አስጀምር",
    returnTo: "ተመለስ ወደ",
    login: "ግባ",
  },
  verify: {
    title: "OTP ያረጋግጡ",
    subtitle: "ወደ ስልክዎ የተላከውን ማረጋገጫ ኮድ ያስገቡ።",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "09XXXXXXXX",
    codeLabel: "OTP ኮድ",
    codePlaceholder: "6-አሃዝ ኮድ",
    requiredPhone: "ስልክ ቁጥር ያስፈልጋል።",
    requiredCode: "OTP ኮድ ያስፈልጋል።",
    verifying: "በማረጋገጥ ላይ...",
    button: "OTP ያረጋግጡ",
    returnText: "ኮድ አልተቀበሉም? ተመለስ ወደ",
    forgotPassword: "የይለፍ ቃል ረሱ",
  },
};

export function useAuthStrings(): AuthStrings {
  const { locale } = useLocale();
  return locale === "am" ? am : en;
}
