import Icon from '../components/Icon';

export default function ProfilePage({ user, onUpdateUser, onBack }) {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdateUser({ profileImage: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black selection:bg-white selection:text-black">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black via-transparent to-black z-10 opacity-60"></div>
        <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-white/[0.03] rounded-full blur-[150px] animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-sm px-4">
        <button
          onClick={onBack}
          className="group mb-12 flex items-center gap-3 text-[0.6rem] font-bold tracking-[0.4em] uppercase text-neutral-500 hover:text-white transition-all duration-500"
        >
          <Icon icon="solar:arrow-left-linear" className="group-hover:-translate-x-2 transition-transform" />
          <span>Back to Archive</span>
        </button>

        <div className="relative">
          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/20 to-transparent rounded-sm blur-[1px]"></div>

          <div className="relative bg-black/60 backdrop-blur-3xl p-10 md:p-12 border border-white/5 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)]">
            <div className="mb-10 overflow-hidden">
              <h2 className="text-2xl font-light tracking-[0.3em] uppercase text-white mb-3 animate-slide-right">PROFILE</h2>
              <div className="h-[1px] w-12 bg-white/40 animate-grow-width"></div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#C5A880]/40 transition-all duration-500">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
                      <Icon icon="solar:user-bold" style={{ fontSize: '3rem' }} className="text-neutral-600" />
                    </div>
                  )}
                </div>
                <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-[#C5A880] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#B89770] transition-colors shadow-lg border-2 border-black">
                  <Icon icon="solar:camera-linear" style={{ fontSize: '1rem' }} className="text-black" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <div className="w-full space-y-5 mt-4">
                <div className="space-y-1 border-b border-white/5 pb-4">
                  <label className="text-[0.5rem] font-bold tracking-[0.3em] uppercase text-neutral-500">Identity</label>
                  <p className="text-sm text-white tracking-wider">{user.name || 'Member'}</p>
                </div>
                <div className="space-y-1 border-b border-white/5 pb-4">
                  <label className="text-[0.5rem] font-bold tracking-[0.3em] uppercase text-neutral-500">Access</label>
                  <p className="text-sm text-white tracking-wider">{user.email || 'No email registered'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[0.5rem] font-bold tracking-[0.3em] uppercase text-neutral-500">Member Since</label>
                  <p className="text-sm text-white tracking-wider">May 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
