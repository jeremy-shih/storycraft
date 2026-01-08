import { signIn } from "@/auth";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <h1 className="mb-4 text-2xl font-bold">Sign In</h1>
            <div className="flex flex-col gap-4">
                <form
                    action={async () => {
                        "use server";
                        await signIn("google");
                    }}
                >
                    <Button type="submit">Sign in with Google</Button>
                </form>

                {process.env.NEXT_PUBLIC_E2E_MOCK_AUTH === "true" && (
                    <form
                        action={async () => {
                            "use server";
                            await signIn("credentials", {
                                username: "testuser",
                                redirectTo: "/",
                            });
                        }}
                    >
                        <Button
                            type="submit"
                            variant="outline"
                            id="mock-login-button"
                        >
                            Sign in as Test User (E2E)
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}
