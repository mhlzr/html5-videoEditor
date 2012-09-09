/**.
 * User: Matthieu Holzer
 * Date: 08.09.12
 * Time: 14:08
 */
define(function () {
    return {

        "DEBUG" : true,

        "API_HOST" : "localhost",
        "API_PORT" : 80,

        "UPLOADER_XHR_PATH" : "/api/upload",
        "UPLOADER_XHR_CHUNK_SIZE" : 1048576, //1MB

        "UPLOADER_BIN_HOST" : "localhost",
        "UPLOADER_BIN_PORT" : 9000,
        "UPLOADER_BIN_CHUNK_SIZE" : 40960 //40KB
    };
});