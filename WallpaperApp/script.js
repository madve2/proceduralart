var seed = getRandomSeed();
var canvas = document.getElementById("myCanvas");

var btnDiscoverNew = document.getElementById('discovernew');
var btnSetWallpaper = document.getElementById('setWallpaper');
var btnSaveImage = document.getElementById('saveImage');
var progress = document.getElementById('progress');
var res = document.getElementById('selResolution');


btnDiscoverNew.addEventListener("click", discoverNew);
btnSetWallpaper.addEventListener("click", setWallpaper);
btnSaveImage.addEventListener("click", saveImage);
progress.style.display = 'none';

//Generate something right away...
discoverNew();

function discoverNew() {
    //applying resolution setting
    var currentRes = res.options[res.selectedIndex].value.split("x");
    if (canvas.width != currentRes[0]) {
        canvas.width = currentRes[0];
        canvas.height = currentRes[1];
    }

    //updating UI state
    btnDiscoverNew.setAttribute('disabled');
    btnSetWallpaper.setAttribute('disabled');
    btnSaveImage.setAttribute('disabled');
    selResolution.setAttribute('disabled');
    progress.style.display = 'flex'; //TODO: a css class would be better to make sure it doesn't become 'block' at one point :)

    //actually Doing The Thing, then restoring UI state
    setTimeout(function () {
        seed = getRandomSeed();
        draw(canvas, seed);
        btnDiscoverNew.removeAttribute('disabled');
        btnSetWallpaper.removeAttribute('disabled');
        btnSaveImage.removeAttribute('disabled');
        selResolution.removeAttribute('disabled');
        progress.style.display = 'none';
    }, 300);

    return false;
}

function setWallpaper() {
    Windows.Storage.ApplicationData.current.localFolder.createFileAsync("wallpaper.png", Windows.Storage.CreationCollisionOption.replaceExisting)
    .then(function (file) {
        return saveImageInternalAsync(file);
    }).then(function () {
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

//TODO: implementing the Windows Share contract (as image source) and the File picker contract would also be nice :)
function saveImage() {
    // Create the picker object and set options
    var savePicker = new Windows.Storage.Pickers.FileSavePicker();
    savePicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
    // Dropdown of file types the user can save the file as
    savePicker.fileTypeChoices.insert("PNG image", [".png"]);
    // Default file name if the user does not type one in or select a file to replace
    savePicker.suggestedFileName = "Planet " + seed;

    savePicker.pickSaveFileAsync().then(function (file) {
        return saveImageInternalAsync(file);
    }).then(function () {
        var msgBox = new Windows.UI.Popups.MessageDialog("Your planet is saved!");
        msgBox.showAsync();
    }, function (error) {
        var msgBox = new Windows.UI.Popups.MessageDialog(error);
        msgBox.showAsync();
    });
}

function saveImageInternalAsync(file) {
    if (!file) {
        return WinJS.Promise.wrapError("No file selected");
    }

    return file.openAsync(Windows.Storage.FileAccessMode.readWrite)
          .then(function (stream) {
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