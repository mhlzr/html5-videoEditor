/**
 * @author Matthieu Holzer
 */

exports.createAVSFromComposition = function (comp) {
    'use strict';

    var avs = [];

    //LoadingPlugins
    avs.push('LoadPlugin("C:\\Program Files (x86)\\AviSynth 2.5\\plugins\\ffms2.dll")');

    //Background
    avs.push('base = BlankClip(length=' + comp.duration * comp.fps + ',width=' + comp.width + ', height=' + comp.height + ', pixel_type="RGB32", fps=' + comp.fps + ', color=$000000, audio_rate=44100')

    var relFilePath = '';
    //Creating all Streams (Clips)
    for (var i = 0; i < comp.seqs.length; i++) {

        relFilePath = '../assets/' + comp.seqs[i].fileName;

        //Index file
        avs.push('FFIndex("' + relFilePath + '")');

        avs.push('stream' + i + ' = AudioDub( FFVideoSource("' + relFilePath + '"), FFAudioSource("' + relFilePath + '")).ChangeFPS(' + comp.fps + ').BilinearResize(' + comp.seqs[i].width + ',' + comp.seqs[i].height + ')');

        //Stacking the videos
        avs.push('o' + i + ' = ' + ((i == 0) ? 'base' : ('o' + (i - 1).toString())) + '.AddVideo(stream' + i + ', ' + comp.seqs[i].position + ', ' + (comp.seqs[i].position + comp.seqs[i].duration).toString() + ', ' + comp.seqs[i].x + ', ' + comp.seqs[i].y + ')');
    }


    //Custom function for stacking
    avs.push('\nfunction AddVideo(clip c1, clip c2, int startFrame, int endFrame, int x, int y)');
    avs.push('{');
    avs.push('c1.ApplyRange(startFrame,endFrame,"Overlay",c2,x,y)');
    avs.push('}');

    //Finish, return last overlay
    avs.push('return o' + (comp.seqs.length - 1).toString());

    return avs.join('\n');
};
