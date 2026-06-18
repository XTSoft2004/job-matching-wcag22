const fs = require('fs');
const content = fs.readFileSync('src/pages/JobDetails.tsx', 'utf8');

const regex = /\{\/\* Accessible Apply Modal Overlay \*\/\}([\s\S]*?)\{\/\* Candidate Summary \*\/\}/g;

const replacement = \{/* Accessible Apply Modal Overlay */}
      <AccessibleModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="?ng tuy?n công vi?c"
        triggerRef={applyBtnRef}
      >
        {modalLoading ? (
          <div className="py-12 text-center space-y-4">
            <div className="h-10 w-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-500 font-semibold text-sm">Ðang t?i h? so ?ng tuy?n c?a b?n...</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-100">
                <Briefcase className="h-5.5 w-5.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-gray-500 text-xs mt-1 truncate font-semibold" title={job?.title}>
                  {job?.title}
                </div>
              </div>
            </div>

            {/* Candidate Summary */}\;

const newContent = content.replace(regex, replacement);

fs.writeFileSync('src/pages/JobDetails.tsx', newContent);
