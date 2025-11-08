import ProfileComponent from "../components/user/Profilecomponent";
import { useRouter } from "next/router";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;

  return <ProfileComponent userId={id} />;
}