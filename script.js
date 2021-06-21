// toaster
const toast = {
    log: (msg) => {
            let toastBlck = document.getElementById("toast"),
                p = document.createElement('p');
                p.classList.add('log');
                p.innerHTML = msg;
                toastBlck.appendChild(p);
            setTimeout(()=>{
                p.remove();
            }, 3000)
        },
    error: (msg) => {
            let toastBlck = document.getElementById("toast"),
                p = document.createElement('p');
                p.classList.add('error');
                p.innerHTML = `<span>${msg}</span><span onclick="this.parentElement.remove()">x</span>`;
                toastBlck.appendChild(p);
        },
};


// set details
const setDetailForm = document.getElementById('setDetailForm');
// my info obj
const pInfo = {};
const setDetails = (e, setDetailForm) => {
    let stored_pid = '',
        pid_changed = false;
    if (localStorage.p_pid != undefined){
        stored_pid = localStorage.p_pid;
    };
    //console.log('old pid:' + stored_pid);
    e.preventDefault();
    let pInfo = {
                    p_name: setDetailForm.name.value,
                    p_pid: setDetailForm.peer.value,
                    p_bio: setDetailForm.bio.value
                };
    // pid change state
    (stored_pid == setDetailForm.peer.value) ? (pid_changed = false) : (pid_changed = true);
    //console.log("pid changed: " + pid_changed);
    // update ls
    localStorage.p_name = pInfo.p_name;
    localStorage.p_pid = pInfo.p_pid;
    localStorage.p_bio = pInfo.p_bio;
    // push data to base or update on pid change state
    if (pid_changed){
        // re launch new peer
        connectToPeer();
    }

    //console.log();

};

// peer establishmet global vars
// main model refs
const setupModal = document.querySelector('.setup');
const facetimeModal = document.querySelector('.facetime');


// setting streams to dom
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

// local streams managing
var incoming_call, outgoing_call, ongoing_call;
// my_pid is the id without prefix
var my_pid;
// peer is the actual peer connection
var peer;

// connect to peer server
function connectToPeer(){
    if (localStorage.p_pid && (localStorage.p_pid != (undefined || ''))){
        toast.log("Connecting To Peer Server...");
        my_pid = localStorage.p_pid;
        peer = new Peer('PICOMEET-' + my_pid);
        peer.on('open', (id) => {
            toast.log("Connected to peer server with peer id: " + id);
            // upload detail to supabase


            toast.log("Waiting for peer to join.")
        });
        peer.on('error', err => {
            console.error(err)
            toast.error(err)
        });
        peer.on('call',(call) => {
            toast.log('incoming....');
            incoming_call = call;

            console.log(call);
            console.log(call.metadata);
            let incoming_peers_name = '',
                bio = '';

                                    // show incoming call popup
                                    let div = document.createElement('div');
                                    div.setAttribute('id', 'incoming');
                                    div.innerHTML = `<div class="call_info">
                                                        <span>INCOMING CALL FROM:</span>
                                                        <h3>${incoming_peers_name}</h3>
                                                        <p>${bio}</p>
                                                    </div>
                                                    <div class="call_btns">
                                                        <button onclick="answer(false, this)">reject</button>
                                                        <button onclick="answer(true, this)">answer</button>
                                                    </div>`;
                                            facetimeModal.style.display = 'block';
                                            setupModal.style.display = 'none';
                                    facetimeModal.appendChild(div)
        });
    } else {
        toast.log('First you have to set details')
        setDetailForm.scrollIntoView()
    };
};

// answering call
const answer = (didAnswer, modal) => {
    if (didAnswer){
        let mediaConstrains = { audio: true,  video: true };
        navigator.mediaDevices.getUserMedia(mediaConstrains)
                .then((stream) => {
                    toast.log('Accepting Call');
                    let local_stream = stream;
                    setLocalStream(local_stream);
                    incoming_call.answer(local_stream);
                    incoming_call.on('stream', (incoming_stream) => {
                        ongoing_call = incoming_call;
                        setRemoteStream(incoming_stream);
                        switchMod(true);
                    });
                    incoming_call.on('close', () => {
                        console.log('closed');
                    });
                    incoming_call.on('error', (e) => {
                        console.log('error' + e);
                    });
                    // remove the answering blk
                    modal.parentElement.parentElement.remove();
                })
                .catch(err => {
                    console.error(err)
                    toast.error(err)
                });
    } else if (!didAnswer){
        // cut the incoming req
        //console.log(incoming_call)
        incoming_call.close();

        // remove the answering blk
        modal.parentElement.parentElement.remove();
        toast.log('call rejected');
        switchMod(false);
    };
};

// joing a peer / call someone
function joinPeer(){
    let remotePeersId = document.getElementById("room-input").value;
    if(remotePeersId == " " || remotePeersId == ""){
        toast.log("Please enter peer id");
        return;
    };
    remote_peers_id = 'PICOMEET-' + remotePeersId;
    toast.log("Triying the entered peer id " + remotePeersId);

    let peer = new Peer();

    peer.on('open', (id) => {
        // upload detail to supabase

        console.log(id);
        let mediaConstrains = { audio: true, video: true };
        navigator.mediaDevices.getUserMedia(mediaConstrains)
            .then((stream) => {
                toast.log("Joining peer");
                local_stream = stream;
                setLocalStream(local_stream);
                outgoing_call = peer.call(remote_peers_id, stream);
                outgoing_call.on('stream', (stream)=>{
                    ongoing_call = outgoing_call;
                    setRemoteStream(stream);
                    switchMod(true);
                });
                outgoing_call.on('close', () => {
                    console.log('closed');
                });
                outgoing_call.on('error', (e) => {
                    console.log('error' + e);
                });
            }).catch(err => {
                toast.error(err);
                console.error(err);
            });
    });

    peer.on('error', err => {
        // check error for deleting peer

        toast.error(err);
        console.error(err)
    });
};


// end call
const endCall = () => {
    // end the call
    ongoing_call.close();
    toast.log("Disconnecting call.");
    switchMod(false);
};




// ui shits
// tabs switcher
const switchMod = (switchToCams = true) => {
    if (switchToCams){
        facetimeModal.style.display = 'block';
        setupModal.style.display = 'none';
    } else if (!switchToCams) {
        facetimeModal.style.display = 'none';
        setupModal.style.display = 'block';
        console.log('setuptime...')
    };
};
/* local video toggler */
const toggleVid = () => {
    let vidContainer = document.querySelector('.local_vid_contain'),
        containerWidth = getComputedStyle(vidContainer).width;
    if (containerWidth != '40px'){
        vidContainer.style.width = "40px";
        vidContainer.style.height = "40px";
        vidContainer.lastElementChild.style.display = 'none';
    } else if (containerWidth == '40px'){
        vidContainer.style.width = "25%";
        vidContainer.style.height = "";
        vidContainer.lastElementChild.style.display = 'block';
    }
};

// request fullscreen
const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
        document.exitFullscreen();
        };
    };
};

/* model toggler */
const models = Array.from(document.querySelectorAll('.m'))
models.forEach(model => {
    let h2 = model.firstElementChild,
        m_wrap = model.lastElementChild;
    h2.onclick = () => {
        let d_state = getComputedStyle(m_wrap).display
        if (d_state == 'block'){
            m_wrap.style.display = 'none'
        } else if (d_state == 'none'){
            m_wrap.style.display = 'block'
        }
    }
})


// Supa base...
// client starting
const { createClient } = supabase,
        supabase_url = 'https://ndiqmjxhfiasqaczxyoj.supabase.co',
        supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMzkxNDYxNywiZXhwIjoxOTM5NDkwNjE3fQ.HWbmBG_klyQD3wfIBgLMjXGuLWyvmdf6cIoBMxh1UVE';
supabase = createClient(supabase_url, supabase_key);

// getting all peers in active peer table
const getAllPeers = async () => {
    let { data: activepeers, error } = await supabase
                                            .from('activepeers')
                                            .select('*');
    error ? console.error(error) : console.log(activepeers);
    displayActivePeers(activepeers);
};
// to delete a peer with given id
const deletPeer = async (peer) => {
    const { data, error } = await supabase
                                .from('activepeers')
                                .delete()
                                .eq('pid', peer)
    error ? console.error(error) : console.log(data);
    // notify
};
// insert peer id to suba data base
const pushToDBase = async () => {
    const { data, error } = await supabase
                                .from('activepeers')
                                .insert([
                                    { 
                                        pid: localStorage.p_pid,
                                        name: localStorage.p_name,
                                        bio: localStorage.p_bio,
                                    },
                                ]);
    error ? console.error(error) : console.log(data);
};
// displaying peers
const peerDisplayUl = document.getElementById('explore')
const displayActivePeers = (peers) => {
   peers.forEach(peer => {
       let pid = peer.pid,
            name = peer.name,
            bio = peer.bio;
        let li = document.createElement('li');
        li.setAttribute('id', pid);
        li.innerHTML = `<div onclick="console.log((this.parentElement).id)">
                            <h3>${name}</h3>
                            <p>${bio}</p>
                        </div>`;
       peerDisplayUl.appendChild(li);
   });
};

// on loading
window.onload = () => {
    // retrieve infos frm ls
    setDetailForm.name.value = localStorage.p_name || '';
    setDetailForm.peer.value = localStorage.p_pid || '';
    setDetailForm.bio.value = localStorage.p_bio || '';
    // connect to peer server
    connectToPeer();
    // populate explorer tab
    //getAllPeers()
    
};