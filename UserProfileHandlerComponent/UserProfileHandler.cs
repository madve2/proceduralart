using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Windows.Foundation;
using Windows.Storage;
using Windows.System.UserProfile;

namespace UserProfileHandlerComponent
{
    public sealed class UserProfileHandler
    {
        public IAsyncOperation<bool> SetWallpaperAsync(string localAppDataFileName)
        {
            return SetWallpaperAsyncInternal(localAppDataFileName).AsAsyncOperation();
        }

        private async Task<bool> SetWallpaperAsyncInternal(string localAppDataFileName)
        {
            bool success = false;
            if (UserProfilePersonalizationSettings.IsSupported())
            {
                var file = await ApplicationData.Current.LocalFolder.GetFileAsync(localAppDataFileName);
                UserProfilePersonalizationSettings profileSettings = UserProfilePersonalizationSettings.Current;
                success = await profileSettings.TrySetWallpaperImageAsync(file);
            }
            return success;
        }
    }
}
