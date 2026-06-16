import { confirmSiteAssignment } from "@/actions/portal";

export default async function ConfirmAssignmentPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await confirmSiteAssignment(token);

  if (!result.ok) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">❌</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">שגיאה</h1>
        <p className="text-gray-500">{result.message}</p>
      </div>
    );
  }

  if (result.alreadyConfirmed) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-4">✅</p>
        <h1 className="text-xl font-bold text-gray-900 mb-2">הביקור כבר אושר</h1>
        <p className="text-gray-500">אישרת את הביקור בעבר. אין צורך לפעול שוב.</p>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">🎉</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">הביקור אושר!</h1>
      <p className="text-gray-500">תודה. אישרת את הביקור בהצלחה. המשגיח יקבל הודעה.</p>
    </div>
  );
}
