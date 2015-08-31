seed = getRandomSeed();
var canvas = document.getElementById("myCanvas");

var btnDiscoverNew = document.getElementById('discovernew');
var btnSetWallpaper = document.getElementById('setWallpaper');


btnDiscoverNew.addEventListener("click", discoverNew);
btnSetWallpaper.addEventListener("click", setWallpaper);

//Generate something right away...
discoverNew();

function discoverNew() {
    btnDiscoverNew.innerHTML = 'working...';
    btnDiscoverNew.setAttribute('disabled');
    btnSetWallpaper.setAttribute('disabled');
    setTimeout(function () {
        var seed = getRandomSeed();
        draw(canvas, seed);
        btnDiscoverNew.innerHTML = 'discover new planet';
        btnDiscoverNew.removeAttribute('disabled');
        btnSetWallpaper.removeAttribute('disabled');
    }, 10);

    return false;
}

function setWallpaper() {
    Windows.Storage.ApplicationData.current.localFolder.createFileAsync("wallpaper.png",
          Windows.Storage.CreationCollisionOption.replaceExisting).then(function (file) {
        if (file) {
            return file.openAsync(Windows.Storage.FileAccessMode.readWrite);
        } else {
            return WinJS.Promise.wrapError("No file selected");
        }
    }).then(function (stream) {
        fileStream = stream;
        var ctx = canvas.getContext("2d");
        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        return Windows.Graphics.Imaging.BitmapEncoder.createAsync(Windows.Graphics.Imaging.BitmapEncoder.pngEncoderId, stream);
    }).then(function (encoder) {
        encoder.setPixelData(Windows.Graphics.Imaging.BitmapPixelFormat.rgba8, Windows.Graphics.Imaging.BitmapAlphaMode.premultiplied,
            canvas.width, canvas.height, 96, 96,
            new Uint8Array(imgData.data));
        //Go do the encoding
        return encoder.flushAsync();
    }).then(function () {
        //Make sure to do this at the end
        fileStream.close();
    }).then(function () {
        var uph = new UserProfileHandlerComponent.UserProfileHandler();
        return uph.setWallpaperAsync("wallpaper.png");
    }).then(function (r) {
        var msgBox = new Windows.UI.Popups.MessageDialog(r ? "Check out your new wallpaper!" : "Can't set wallpaper :(");
        msgBox.showAsync();
    }, function (error) {
        var msgBox = new Windows.UI.Popups.MessageDialog(error);
        msgBox.showAsync();
    });
}