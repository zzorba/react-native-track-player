import { AppRegistry, DeviceEventEmitter, NativeEventEmitter, Platform, Animated, } from 'react-native';
import TrackPlayer from './TrackPlayerModule';
import resolveAssetSource from './resolveAssetSource';
const isAndroid = Platform.OS === 'android';
const emitter = !isAndroid
    ? new NativeEventEmitter(TrackPlayer)
    : DeviceEventEmitter;
const animatedVolume = new Animated.Value(1);
animatedVolume.addListener((state) => TrackPlayer.setVolume(state.value));
// MARK: - Helpers
function resolveImportedAssetOrPath(pathOrAsset) {
    return pathOrAsset === undefined
        ? undefined
        : typeof pathOrAsset === 'string'
            ? pathOrAsset
            : resolveImportedAsset(pathOrAsset);
}
function resolveImportedAsset(id) {
    return id
        ? resolveAssetSource(id) ?? undefined
        : undefined;
}
// MARK: - General API
/**
 * Initializes the player with the specified options.
 *
 * Note that on Android this method must only be called while the app is in the
 * foreground, otherwise it will throw an error with code
 * `'android_cannot_setup_player_in_background'`. In this case you can wait for
 * the app to be in the foreground and try again.
 *
 * @param options The options to initialize the player with.
 * @see https://rntp.dev/docs/api/functions/lifecycle
 */
export async function setupPlayer(options = {}, background = false) {
    return isAndroid
        ? TrackPlayer.setupPlayer(options, background)
        : TrackPlayer.setupPlayer(options);
}
/**
 * Register the playback service. The service will run as long as the player runs.
 */
export function registerPlaybackService(factory) {
    if (isAndroid) {
        // Registers the headless task
        AppRegistry.registerHeadlessTask('TrackPlayer', factory);
    }
    else if (Platform.OS === 'web') {
        factory()();
    }
    else {
        // Initializes and runs the service in the next tick
        setImmediate(factory());
    }
}
export function addEventListener(event, listener) {
    return emitter.addListener(event, listener);
}
/**
 * @deprecated This method should not be used, most methods reject when service is not bound.
 */
export function isServiceRunning() {
    return TrackPlayer.isServiceRunning();
}
export async function add(tracks, insertBeforeIndex = -1) {
    const resolvedTracks = (Array.isArray(tracks) ? tracks : [tracks]).map((track) => ({
        ...track,
        url: resolveImportedAssetOrPath(track.url),
        artwork: resolveImportedAssetOrPath(track.artwork),
    }));
    return resolvedTracks.length < 1
        ? undefined
        : TrackPlayer.add(resolvedTracks, insertBeforeIndex);
}
/**
 * Replaces the current track or loads the track as the first in the queue.
 *
 * @param track The track to load.
 */
export async function load(track) {
    return TrackPlayer.load(track);
}
/**
 * Move a track within the queue.
 *
 * @param fromIndex The index of the track to be moved.
 * @param toIndex The index to move the track to. If the index is larger than
 * the size of the queue, then the track is moved to the end of the queue.
 */
export async function move(fromIndex, toIndex) {
    return TrackPlayer.move(fromIndex, toIndex);
}
export async function remove(indexOrIndexes) {
    return TrackPlayer.remove(Array.isArray(indexOrIndexes) ? indexOrIndexes : [indexOrIndexes]);
}
/**
 * Clears any upcoming tracks from the queue.
 */
export async function removeUpcomingTracks() {
    return TrackPlayer.removeUpcomingTracks();
}
/**
 * Skips to a track in the queue.
 *
 * @param index The index of the track to skip to.
 * @param initialPosition (Optional) The initial position to seek to in seconds.
 */
export async function skip(index, initialPosition = -1) {
    return TrackPlayer.skip(index, initialPosition);
}
/**
 * Skips to the next track in the queue.
 *
 * @param initialPosition (Optional) The initial position to seek to in seconds.
 */
export async function skipToNext(initialPosition = -1) {
    return TrackPlayer.skipToNext(initialPosition);
}
/**
 * Skips to the previous track in the queue.
 *
 * @param initialPosition (Optional) The initial position to seek to in seconds.
 */
export async function skipToPrevious(initialPosition = -1) {
    return TrackPlayer.skipToPrevious(initialPosition);
}
// MARK: - Control Center / Notifications API
/**
 * Updates the configuration for the components.
 *
 * @param options The options to update.
 * @see https://rntp.dev/docs/api/functions/player#updateoptionsoptions
 */
export async function updateOptions({ alwaysPauseOnInterruption, ...options } = {}) {
    return TrackPlayer.updateOptions({
        ...options,
        android: {
            // Handle deprecated alwaysPauseOnInterruption option:
            alwaysPauseOnInterruption: options.android?.alwaysPauseOnInterruption ?? alwaysPauseOnInterruption,
            ...options.android,
        },
        icon: resolveImportedAsset(options.icon),
        playIcon: resolveImportedAsset(options.playIcon),
        pauseIcon: resolveImportedAsset(options.pauseIcon),
        stopIcon: resolveImportedAsset(options.stopIcon),
        previousIcon: resolveImportedAsset(options.previousIcon),
        nextIcon: resolveImportedAsset(options.nextIcon),
        // rewindIcon: resolveImportedAsset(options.rewindIcon),
        // forwardIcon: resolveImportedAsset(options.forwardIcon),
    });
}
/**
 * Updates the metadata of a track in the queue. If the current track is updated,
 * the notification and the Now Playing Center will be updated accordingly.
 *
 * @param trackIndex The index of the track whose metadata will be updated.
 * @param metadata The metadata to update.
 */
export async function updateMetadataForTrack(trackIndex, metadata) {
    return TrackPlayer.updateMetadataForTrack(trackIndex, {
        ...metadata,
        artwork: resolveImportedAssetOrPath(metadata.artwork),
    });
}
/**
 * @deprecated Nominated for removal in the next major version. If you object
 * to this, please describe your use-case in the following issue:
 * https://github.com/doublesymmetry/react-native-track-player/issues/1653
 */
export function clearNowPlayingMetadata() {
    return TrackPlayer.clearNowPlayingMetadata();
}
/**
 * Updates the metadata content of the notification (Android) and the Now Playing Center (iOS)
 * without affecting the data stored for the current track.
 */
export function updateNowPlayingMetadata(metadata) {
    return TrackPlayer.updateNowPlayingMetadata({
        ...metadata,
        artwork: resolveImportedAssetOrPath(metadata.artwork),
    });
}
// MARK: - Player API
/**
 * Resets the player stopping the current track and clearing the queue.
 */
export async function reset() {
    return TrackPlayer.reset();
}
/**
 * Plays or resumes the current track.
 */
export async function play() {
    return TrackPlayer.play();
}
/**
 * Pauses the current track.
 */
export async function pause() {
    return TrackPlayer.pause();
}
/**
 * Stops the current track.
 */
export async function stop() {
    return TrackPlayer.stop();
}
/**
 * Sets wether the player will play automatically when it is ready to do so.
 * This is the equivalent of calling `TrackPlayer.play()` when `playWhenReady = true`
 * or `TrackPlayer.pause()` when `playWhenReady = false`.
 */
export async function setPlayWhenReady(playWhenReady) {
    return TrackPlayer.setPlayWhenReady(playWhenReady);
}
/**
 * Gets wether the player will play automatically when it is ready to do so.
 */
export async function getPlayWhenReady() {
    return TrackPlayer.getPlayWhenReady();
}
/**
 * Seeks to a specified time position in the current track.
 *
 * @param position The position to seek to in seconds.
 */
export async function seekTo(position) {
    return TrackPlayer.seekTo(position);
}
/**
 * Seeks by a relative time offset in the current track.
 *
 * @param offset The time offset to seek by in seconds.
 */
export async function seekBy(offset) {
    return TrackPlayer.seekBy(offset);
}
/**
 * Sets the volume of the player.
 *
 * @param volume The volume as a number between 0 and 1.
 */
export async function setVolume(level) {
    return TrackPlayer.setVolume(level);
}
/**
 * Sets the volume of the player with a simple linear scaling.
 * In Android this is achieved via a native thread call.
 * In other platforms this is achieved via RN's Animated.Value.
 *
 * @param volume The volume as a number between 0 and 1.
 * @param duration The duration of the animation in milliseconds. defualt is 0 ms, which just functions as TP.setVolume.
 * @param init The initial value of the volume. This may be useful eg to be 0 for a fade in event.
 * @param interval The interval of the animation in milliseconds. default is 20 ms.
 * @param msg (Android) The message to be emitted after volume is fully changed, via Event.PlaybackAnimatedVolumeChanged.
 * @param callback (other platforms) The callback to be called after volume is fully changed.
 */
export const setAnimatedVolume = async ({ volume, duration = 0, init = -1, interval = 20, msg = '', callback = () => undefined, }) => {
    if (duration === 0) {
        TrackPlayer.setVolume(volume);
        return callback();
    }
    if (init !== -1) {
        TrackPlayer.setVolume(init);
    }
    if (isAndroid) {
        return TrackPlayer.setAnimatedVolume(volume, duration, interval, msg);
    }
    else {
        /*
        TODO: Animated.value change relies on React rendering so Android
        headlessJS will not work with it. however does iOS and windows work in the background?
        if not this code block is needed
        if (AppState.currentState !== 'active') {
          // need to figure out a way to run Animated.timing in background. probably needs our own module
          duration = 0;
        }
        */
        volume = Math.min(volume, 1);
        if (duration === 0) {
            animatedVolume.setValue(volume);
            callback();
            return;
        }
        animatedVolume.stopAnimation();
        Animated.timing(animatedVolume, {
            toValue: volume,
            useNativeDriver: true,
            duration,
        }).start(() => callback());
    }
};
/**
 * performs fading out to pause playback.
 * @param duration duration of the fade progress in ms
 * @param interval interval of the fade progress in ms
 */
export const fadeOutPause = async (duration = 500, interval = 20) => {
    if (isAndroid) {
        TrackPlayer.fadeOutPause(duration, interval);
    }
    else {
        setAnimatedVolume({
            duration,
            interval,
            volume: 0,
            callback: () => pause(),
        });
    }
};
/**
 * performs fading into playing the next track.
 * @param duration duration of the fade progress in ms
 * @param interval interval of the fade progress in ms
 * @param toVolume volume to fade into
 */
export const fadeOutNext = async (duration = 500, interval = 20, toVolume = 1) => {
    if (isAndroid) {
        TrackPlayer.fadeOutNext(duration, interval, toVolume);
    }
    else {
        setAnimatedVolume({
            duration,
            interval,
            volume: 0,
            callback: async () => {
                await skipToNext();
                setAnimatedVolume({
                    duration,
                    interval,
                    volume: toVolume,
                });
            },
        });
    }
};
/**
 * performs fading into playing the previous track.
 * @param duration duration of the fade progress in ms
 * @param interval interval of the fade progress in ms
 * @param toVolume volume to fade into
 */
export const fadeOutPrevious = async (duration = 500, interval = 20, toVolume = 1) => {
    if (isAndroid) {
        TrackPlayer.fadeOutPrevious(duration, interval, toVolume);
    }
    else {
        setAnimatedVolume({
            duration,
            interval,
            volume: 0,
            callback: async () => {
                await skipToPrevious();
                setAnimatedVolume({
                    duration,
                    interval,
                    volume: toVolume,
                });
            },
        });
    }
};
/**
 * performs fading into skipping to a track.
 * @param index the index of the track to skip to
 * @param duration duration of the fade progress in ms
 * @param interval interval of the fade progress in ms
 * @param toVolume volume to fade into
 */
export const fadeOutJump = async (index, duration = 500, interval = 20, toVolume = 1) => {
    if (isAndroid) {
        TrackPlayer.fadeOutJump(index, duration, interval, toVolume);
    }
    else {
        setAnimatedVolume({
            duration,
            interval,
            volume: 0,
            callback: async () => {
                await skip(index);
                setAnimatedVolume({
                    duration,
                    interval,
                    volume: toVolume,
                });
            },
        });
    }
};
/**
 * Sets the playback rate.
 *
 * @param rate The playback rate to change to, where 0.5 would be half speed,
 * 1 would be regular speed, 2 would be double speed etc.
 */
export async function setRate(rate) {
    return TrackPlayer.setRate(rate);
}
/**
 * Sets the queue.
 *
 * @param tracks The tracks to set as the queue.
 * @see https://rntp.dev/docs/api/constants/repeat-mode
 */
export async function setQueue(tracks) {
    return TrackPlayer.setQueue(tracks);
}
/**
 * Sets the queue repeat mode.
 *
 * @param repeatMode The repeat mode to set.
 * @see https://rntp.dev/docs/api/constants/repeat-mode
 */
export async function setRepeatMode(mode) {
    return TrackPlayer.setRepeatMode(mode);
}
// MARK: - Getters
/**
 * Gets the volume of the player as a number between 0 and 1.
 */
export async function getVolume() {
    return TrackPlayer.getVolume();
}
/**
 * Gets the playback rate where 0.5 would be half speed, 1 would be
 * regular speed and 2 would be double speed etc.
 */
export async function getRate() {
    return TrackPlayer.getRate();
}
/**
 * Gets a track object from the queue.
 *
 * @param index The index of the track.
 * @returns The track object or undefined if there isn't a track object at that
 * index.
 */
export async function getTrack(index) {
    return TrackPlayer.getTrack(index);
}
/**
 * Gets the whole queue.
 */
export async function getQueue() {
    return TrackPlayer.getQueue();
}
/**
 * Gets the index of the active track in the queue or undefined if there is no
 * current track.
 */
export async function getActiveTrackIndex() {
    return (await TrackPlayer.getActiveTrackIndex()) ?? undefined;
}
/**
 * Gets the active track or undefined if there is no current track.
 */
export async function getActiveTrack() {
    return (await TrackPlayer.getActiveTrack()) ?? undefined;
}
/**
 * Gets the index of the current track or null if there is no current track.
 *
 * @deprecated use `TrackPlayer.getActiveTrackIndex()` instead.
 */
export async function getCurrentTrack() {
    return TrackPlayer.getActiveTrackIndex();
}
/**
 * Gets the duration of the current track in seconds.
 * @deprecated Use `TrackPlayer.getProgress().then((progress) => progress.duration)` instead.
 */
export async function getDuration() {
    return TrackPlayer.getDuration();
}
/**
 * Gets the buffered position of the current track in seconds.
 *
 * @deprecated Use `TrackPlayer.getProgress().then((progress) => progress.buffered)` instead.
 */
export async function getBufferedPosition() {
    return TrackPlayer.getBufferedPosition();
}
/**
 * Gets the playback position of the current track in seconds.
 * @deprecated Use `TrackPlayer.getProgress().then((progress) => progress.position)` instead.
 */
export async function getPosition() {
    return TrackPlayer.getPosition();
}
/**
 * Gets information on the progress of the currently active track, including its
 * current playback position in seconds, buffered position in seconds and
 * duration in seconds.
 */
export async function getProgress() {
    return TrackPlayer.getProgress();
}
/**
 * @deprecated use (await getPlaybackState()).state instead.
 */
export async function getState() {
    return (await TrackPlayer.getPlaybackState()).state;
}
/**
 * Gets the playback state of the player.
 *
 * @see https://rntp.dev/docs/api/constants/state
 */
export async function getPlaybackState() {
    return TrackPlayer.getPlaybackState();
}
/**
 * Gets the queue repeat mode.
 *
 * @see https://rntp.dev/docs/api/constants/repeat-mode
 */
export async function getRepeatMode() {
    return TrackPlayer.getRepeatMode();
}
/**
 * Retries the current item when the playback state is `State.Error`.
 */
export async function retry() {
    return TrackPlayer.retry();
}
/**
 * Sets the content hierarchy of Android Auto (Android only). The hierarchy structure is a dict with
 * the mediaId as keys, and a list of MediaItem as values. To use, you must at least specify the root directory, where
 * the key is "/". If the root directory contains BROWSABLE MediaItems, they will be shown as tabs. Do note Google requires
 * AA to have a max of 4 tabs. You may then set the mediaId keys of the browsable MediaItems to be a list of other MediaItems.
 *
 * @param browseTree the content hierarchy dict.
 * @returns a serialized copy of the browseTree set by native. For debug purposes.
 */
export async function setBrowseTree(browseTree) {
    if (!isAndroid)
        return new Promise(() => '');
    return TrackPlayer.setBrowseTree(browseTree);
}
/**
 * this method enables android auto playback progress tracking; see
 * https://developer.android.com/training/cars/media#browse-progress-bar
 * android only.
 * @param mediaID the mediaID.
 * @returns
 */
export async function setPlaybackState(mediaID) {
    if (!isAndroid)
        return;
    TrackPlayer.setPlaybackState(mediaID);
}
/**
 * Sets the content style of Android Auto (Android only).
 * there are list style and grid style. see https://developer.android.com/training/cars/media#apply_content_style .
 * the styles are applicable to browsable nodes and playable nodes. setting the args to true will yield the list style.
 * false = the grid style.
 */
export function setBrowseTreeStyle(browsableStyle, playableStyle) {
    if (!isAndroid)
        return null;
    TrackPlayer.setBrowseTreeStyle(browsableStyle, playableStyle);
    return null;
}
/**
 * acquires the wake lock of MusicService (android only.)
 */
export async function acquireWakeLock() {
    if (!isAndroid)
        return;
    TrackPlayer.acquireWakeLock();
}
/**
 * acquires the wake lock of MusicService (android only.)
 */
export async function abandonWakeLock() {
    if (!isAndroid)
        return;
    TrackPlayer.abandonWakeLock();
}
/**
 * prepare to crossfade (android only.) the crossfade alternate
 * player will be automatically primed to the current player's index,
 * then by previous = true or not, skip to previous or next. player
 * will be prepared. its advised to call this well before actually performing
 * crossfade so the resource can be prepared.
 */
export async function crossFadePrepare(previous = false) {
    if (!isAndroid)
        return;
    TrackPlayer.crossFadePrepare(previous);
}
/**
 * perform crossfade (android only). fadeDuration and fadeInterval are both in ms.
 * fadeToVolume is a float from 0-1.
 */
export async function crossFade(fadeDuration = 2000, fadeInterval = 20, fadeToVolume = 1) {
    if (!isAndroid)
        return;
    TrackPlayer.switchExoPlayer(fadeDuration, fadeInterval, fadeToVolume);
}
/**
 * get onStartCommandIntent is null or not (Android only.). this is used to identify
 * if musicservice is restarted or not.
 */
export async function validateOnStartCommandIntent() {
    if (!isAndroid)
        return true;
    return TrackPlayer.validateOnStartCommandIntent();
}
