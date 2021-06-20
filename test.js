
const switchTab = () => {
    let facetime_d_state = getComputedStyle(facetimeModal).display,
        setup_d_state = getComputedStyle(setupModal).display;
    if (facetime_d_state == 'none' && setup_d_state == 'block'){
        facetimeModal.style.display = 'block';
        setupModal.style.display = 'none';
        console.log('facetime...');
    };
};
function setLocalStream(stream){
    let video = document.getElementById("local-video");
    video.srcObject = stream;
    video.muted = true;
    video.volume = 0;
    video.play();
};
function setRemoteStream(stream){
    let video = document.getElementById("remote-video");
    video.srcObject = stream;
    video.play();
};

const getStream = (audio = true, video = true) => {
    let mediaConstrains = {
            audio: audio,
            video: video
        };
    navigator.mediaDevices.getUserMedia(mediaConstrains)
        .then((stream) => {
            return stream;
        })
        .catch(err => {
            console.error(err)
            console.error(err)
        });
};
const local_stream = getStream();
setLocalStream(local_stream);


var PeerConnection;

var call;

        PeerConnection = new Peer();
        PeerConnection.on('open', (id) => {
            console.log("Connected to peer server with peer id: " + id);
            console.log("Waiting for peer to join.")
        });

        PeerConnection.on('error', err => {
            console.error(err)
            console.error(err)
        });

        PeerConnection.on('call', (call) => {
            console.log(call)
            console.log('incoming....');
            call.answer(local_stream);
        });

        call.on('stream', (incoming_stream)=>{
            setRemoteStream(incoming_stream);
            switchTab();
        });

function joinPeer(id){
    let remotePeersId = document.getElementById("room-input").value || id;
    console.log("Triying the entered peer id " + remotePeersId);
    call = PeerConnection.call(remotePeersId, local_stream);
};
