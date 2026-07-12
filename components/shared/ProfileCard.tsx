interface ProfileCardProps {
  name: string;
  email?: string;
  specialty?: string;
  profilePictureUrl?: string;
}

export default function ProfileCard({
  name,
  email,
  specialty,
  profilePictureUrl,
}: ProfileCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      {profilePictureUrl ? (
        <img
          src={profilePictureUrl}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-600">
            {name.charAt(0)}
          </span>
        </div>
      )}
      <div>
        <h3 className="font-semibold text-lg">{name}</h3>
        {email && <p className="text-sm text-gray-600">{email}</p>}
        {specialty && <p className="text-sm text-gray-600">{specialty}</p>}
      </div>
    </div>
  );
}
