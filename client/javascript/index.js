function toggleAudio(audioId, toggleId) {
	audio = document.getElementById(audioId);
	toggle = document.getElementById(toggleId);
	if (audio.muted) {
		audio.muted = false;
		toggle.style.textDecoration = 'none';
	} else {
		audio.muted = true;
		toggle.style.textDecoration = 'line-through';
	}
}
