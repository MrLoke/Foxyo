import { createClient } from "@/lib/supabase/server";
import AccountForm from "./AccountForm";

const Account = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("id, nickname, username, avatar_url")
    .eq("id", user?.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error reading profile:", profileError);
  }

  return (
    <>
      <h1>Your Account</h1>
      <AccountForm user={profileData} />
    </>
  );
};

export default Account;
