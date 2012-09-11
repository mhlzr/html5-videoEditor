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
        "UPLOADER_SOCKET_CHUNK_SIZE" : 1048576 //1MB
    };
});