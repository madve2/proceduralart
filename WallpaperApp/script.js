seed = getRandomSeed();
var canvas = document.getElementById("myCanvas");

var btnDiscoverNew = document.getElementById('discovernew');
var btnSetWallpaper = document.getElementById('setWallpaper');
var progress = document.getElementById('progress');


btnDiscoverNew.addEventListener("click", discoverNew);
btnSetWallpaper.addEventListener("click", setWallpaper);
progress.style.display = 'none';

//Generate something right away...
discoverNew();

function discoverNew() {
    btnDiscoverNew.innerHTML = 'working...';
    btnDiscoverNew.setAttribute('disabled');
    btnSetWallpaper.setAttribute('disabled');
    progress.style.display = 'flex'; //TODO: a css class would be better to make sure it doesn't become 'block' at one point :)
    setTimeout(function () {
        var seed = getRandomSeed();
        draw(canvas, seed);
        btnDiscoverNew.innerHTML = 'discover new planet';
        btnDiscoverNew.removeAttribute('disabled');
        btnSetWallpaper.removeAttribute('disabled');
        progress.style.display = 'none';
    }, 300);

    return false;
}

function setWallpaper() {
    saveImageInternalAsync("wallpaper.png").then(function () {
        var uph = new UserProfileHandlerComponent.UserProfileHandler();
        //TODO: use JS to implement this method as well; no actual reason to use .NET for a few lines of code
        return uph.setWallpaperAsync("wallpaper.png");
    }).then(function (r) {
        var msgBox = new Windows.UI.Popups.MessageDialog(r ? "Check out your new wallpaper!" : "Can't set wallpaper :(");
        msgBox.showAsync();
    }, function (error) {
        var msgBox = new Windows.UI.Popups.MessageDialog(error);
        msgBox.showAsync();
    });
}

function saveImageInternalAsync(fileName) {
    return Windows.Storage.ApplicationData.current.localFolder.createFileAsync(fileName,
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
              return;
          });
}