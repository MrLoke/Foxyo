import { signOutAction } from "@/actions/auth";
import { ModeToggle } from "@/components/ModeToggle/ModeToggle";
import { SIGNIN_ROUTE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";

const DashboardPage = async () => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect(SIGNIN_ROUTE);
  }

  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Error reading profile:", profileError);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <ModeToggle />

      <div className="flex flex-col items-center text-xl my-8">
        <strong>Welcome!</strong>
        <br />
        Jesteś zalogowany jako:
        <strong>
          {user.user_metadata?.username || user.user_metadata?.full_name}
        </strong>
        <strong>{user?.email}</strong>
      </div>

      {profileData?.avatar_url ? (
        <Image
          src={profileData.avatar_url}
          alt="Avatar użytkownika"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full border-2 border-green-400 shadow-lg object-cover mb-6"
        />
      ) : (
        <div className="w-24 h-24 rounded-full flex items-center justify-center">
          Brak avatara
        </div>
      )}

      <p className="mb-4">
        <strong>ID:</strong> {user.id}
      </p>

      <form action={signOutAction}>
        <button
          type="submit"
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Wyloguj się
        </button>
      </form>
    </div>
  );
};

export default DashboardPage;
