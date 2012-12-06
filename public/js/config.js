/**.
 * User: Matthieu Holzer
 * Date: 08.09.12
 * Time: 14:08
 */
define(function () {
    return {

        'DEBUG' : true,

        'API_HOST' : window.location.host,
        'API_PORT' : 80,

        'WEBSOCKET_HOST' : window.location.host,
        'WEBSOCKET_PORT' : 3000,

        'UPLOADER_CHUNK_SIZE'            : 1048576, //1MB
        'UPLOADER_SUPPORTED_VIDEO_TYPES' : ['ogg', 'mp4', 'webm', 'avi', 'flv', 'mpeg', 'mpg', 'mkv', 'mov'],
        'UPLOADER_SUPPORTED_AUDIO_TYPES' : ['ogg', 'mp4', 'mp3', 'mp2', 'mpa', 'flac', 'opus'],
        'UPLOADER_SUPPORTED_IMAGE_TYPES' : ['jpeg', 'jpg', 'png'],

        'MEDIA_METADATA_ANALYZE_MAX_TIMEOUT' : 2000, //2s
        'MEDIA_NEEDED_FORMATS'               : {
            'video' : ['webm', 'ogg', 'mp4'],
            'audio' : ['mp3', 'ogg'],
            'image' : ['jpeg']
        },
        'MEDIA_VIDEO_MIN_WIDTH'              : 100,
        'MEDIA_VIDEO_MIN_HEIGHT'             : 100,

        'GUI_MIN_WINDOW_WIDTH'    : 800,
        'GUI_MIN_WINDOW_HEIGHT'   : 500,
        'GUI_MAX_FILENAME_LENGTH' : 32,

        'GUI_TIMELINE_PIXEL_PER_FRAME'    : 3,
        'GUI_TIMELINE_CANVAS_MAX_WIDTH'   : 1000,
        'GUI_TIMELINE_AUTOSCROLL_PADDING' : 20,

        'USER_SETTINGS_ID' : 'settings'
    };
});