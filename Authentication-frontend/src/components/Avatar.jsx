function Avatar({ fullName, onClick }) {
    const initial = fullName?.charAt(0).toUpperCase() || '?';

    return (
        <button
            onClick={onClick}
            title="Change profile"
            className="w-9 h-9 rounded-full bg-orange-500 text-white font-semibold flex items-center justify-center hover:bg-orange-600 transition-colors"
        >
            {initial}
        </button>
    );
}

export default Avatar;