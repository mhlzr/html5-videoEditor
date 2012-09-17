/**.
 * User: Matthieu Holzer
 * Date: 08.09.12
 * Time: 14:08
 */
define(function () {
    return {

        "DEBUG" : true,

        "API_HOST" : "192.168.178.34",
        "API_PORT" : 80,

        "WEBSOCKET_HOST" : "192.168.178.34",
        "WEBSOCKET_PORT" : 3000,

        "UPLOADER_XHR_PATH"       : "/api/upload",
        "UPLOADER_XHR_CHUNK_SIZE" : 1048576, //1MB
        "UPLOADER_SOCKET_CHUNK_SIZE" : 1048576, //1MB
        "UPLOADER_SUPPORTED_VIDEO_TYPES" : ["ogv","mp4","webm","avi","flv","mpeg","mpg","mkv","mov"],
        "UPLOADER_SUPPORTED_AUDIO_TYPES" : ["ogg","mp4","mp3","mp2","mpa","flac","opus"],
        "UPLOADER_SUPPORTED_IMAGE_TYPES" : ["jpeg","jpg","png"]    ,


        "GUI_MIN_WINDOW_WIDTH" : 800,
        "GUI_MIN_WINDOW_HEIGHT" : 500,
        "GUI_MAX_FILENAME_LENGTH" : 35
    };
});