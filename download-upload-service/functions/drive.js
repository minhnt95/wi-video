let google = require('googleapis');
var fs = require('fs');
var config = require('config');

function findInfoById(auth, id, callback) {
    let drive = google.drive({
        version: 'v3',
        auth: auth
    });
    drive.files.get({
        fileId: id
    }, {
        acknowledgeAbuse: true
    }, function (err, result) {
        callback(err, result);
    });
}

function findFolderByName(auth, folderName, callback) {
    let drive = google.drive({
        version: 'v3',
        auth: auth
    });
    let condition = "name = '" + folderName + "' and mimeType = 'application/vnd.google-apps.folder'";
    // console.log("CONDITION : ", condition);
    drive.files.list({
        q: condition,
        orderBy: "createdTime"
    }, function (err, result) {
        if (err) return callback(err, null);
        if (result.files.length > 0) {
            callback(false, result.files[0].id);
        } else {
            callback(false, null);
        }
    });
}

function findFiles(auth, folderId, callback) {
    let drive = google.drive({
        version: 'v3',
        auth: auth
    });

    let condition = "'" + folderId + "' in parents";
    console.log("FIND FILES CONDITIONS : ", condition);
    drive.files.list({
        q: condition,
        orderBy: "createdTime"
    }, function (err, result) {
        if (err) return callback(err, null);
        callback(false, result);
    });
}

function createFolder(auth, folderName, callback) {
    let drive = google.drive({
        version: 'v3',
        auth: auth
    });

    let condition = "name = '" + folderName + "' and mimeType = 'application/vnd.google-apps.folder'";
    drive.files.list({
        q: condition
    }, function (err, result) {
        if (err) return callback(err, null);
        if (result.files.length > 0) {
            callback(false, result.files[0].id);
        } else {
            var fileMetadata = {
                'name': folderName,
                'mimeType': 'application/vnd.google-apps.folder'
            };
            drive.files.create({
                resource: fileMetadata,
                fields: 'id'
            }, function (err, file) {
                if (err) {
                    // Handle error
                    console.error(err);
                    callback(err, null);
                } else {
                    callback(false, file.id);
                }
            });
        }
    });
}

function uploadFile(auth, folderId, filePath, driveName, callback) {
    let drive = google.drive({
        version: 'v3',
        auth: auth
    });

    var fileMetadata = {
        'name': driveName,
        parents: [folderId]
    };
    var media = {
        body: fs.createReadStream(filePath)
    };
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, function (err, file) {
        if (err) {
            // Handle error
            console.error("===CREATE FILE ERROR===== ", err);
            callback(err, null);
        } else {
            console.log('File Id: ', file.id);
            callback(false, file);
        }
    });
}

module.exports = {
    createFolder: createFolder,
    uploadFile: uploadFile,
    findFiles: findFiles,
    findFolderByName: findFolderByName,
    findInfoById: findInfoById
}