// TOASTER OBJ
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

// SWITCH ACTIVE TABS
const setupModal = document.querySelector('.setup');
const facetimeModal = document.querySelector('.facetime');
const switchMod = (switchToCams = true) => {
    if (switchToCams){
        facetimeModal.style.display = 'block';
        setupModal.style.display = 'none';
        //console.log('facetime...');
    } else if (!switchToCams) {
        facetimeModal.style.display = 'none';
        setupModal.style.display = 'block';
        //console.log('setuptime...')
    };
};
// L VID TOGGLER
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

// FULL SCREEN TOGGLER
const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
        document.exitFullscreen();
        };
    };
};
// MODEL H2 CKICK EVNT
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
});
// HIDE SPLASH SCREEN
const splashScreen = document.querySelector('.splash')
const hideSplashScreen = () => {
    splashScreen.style.display = 'none'
}
// SET INFO MNGR //////////////////////////////////////////////////////////////////////////////////// SET INFO MNGR //
const setDetailForm = document.getElementById('setDetailForm');
const pInfo = {};
const setDetails = (e, setDetailForm) => {
        e.preventDefault();
        let stored_pid = '',
            pid_changed = false;
        if (localStorage.p_pid != undefined){
            stored_pid = localStorage.p_pid;
        };
        let pInfo = {
                        p_name: setDetailForm.name.value,
                        p_pid: setDetailForm.peer.value,
                        p_bio: setDetailForm.bio.value
                    };
        (stored_pid == setDetailForm.peer.value) ? (pid_changed = false) : (pid_changed = true);
        // UPDATE LS
        localStorage.p_name = pInfo.p_name;
        localStorage.p_pid = pInfo.p_pid;
        localStorage.p_bio = pInfo.p_bio;
        if (pid_changed){
            // UPADTE PID ON BASE
            console.log('pid changed the effect needs a manual reload of loaction')
        };
    };
    // RETRIEVE INFO OBJ FRM LS
    setDetailForm.name.value = localStorage.p_name || '';
    setDetailForm.peer.value = localStorage.p_pid || '';
    setDetailForm.bio.value = localStorage.p_bio || '';


// STREAM ON DOM SETTER FNS /////////////////////////////////////////////////////////////// STREAM ON DOM SETTER FNS //

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


// PEER CONNECTING TO SERVER /////////////////////////////////////////////////////////////// PEER CONNECTING TO SERVER //
var ongoing_call;   // VAR TO USE FOR ENDING CALL
var PeerConnection;
    // PUT PREF ID INTO PEER CREATOR < ON FINELIZATION >
    PeerConnection = new Peer();
    PeerConnection.on('open', (id) => {
        console.log(id);
        toast.log('connected with id: ' + id);
        // HIDE SPLASH SCREEN
        hideSplashScreen();
    });
    PeerConnection.on('error', err => {
        console.error(err);
        toast.error(err)
        // HIDE SPLASH SCREEN
        hideSplashScreen();
    });

var in_call;
    PeerConnection.on('call', (call) => {
        toast.log('incoming....');
        in_call = call;

        let incoming_peers_info = in_call.metadata.split('***');
        // show incoming call popup
        let div = document.createElement('div');
        div.setAttribute('id', 'incoming');
        div.innerHTML = `<div class="call_info">
                            <span>INCOMING CALL FROM:</span>
                            <h3>${incoming_peers_info[0]}</h3>
                            <p>${incoming_peers_info[1]}</p>
                        </div>
                        <div class="call_btns">
                            <button onclick="answer(false, this)">reject</button>
                            <button onclick="answer(true, this)">answer</button>
                        </div>`;
        setupModal.appendChild(div);
    });

// ASWERING CALL BLK
const answer = (didAnswer, modal) => {
    modal.parentElement.parentElement.remove();
    if (didAnswer){
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((l_stream) => {
            in_call.answer(l_stream);
                setLocalStream(l_stream);
                switchMod(true);
                ongoing_call = in_call;
            in_call.on('stream', (incoming_stream) => {
                //console.log('getting stream from other end')
                setRemoteStream(incoming_stream);
            });
            in_call.on('close', () => {
                console.log('closed');
            });
            in_call.on('error', (e) => {
                console.log(e);
            });
        }).catch(err => {
            console.error(err)
            console.error(err)
        });
    } else if (!didAnswer){
        incoming_call.close();
        toast.log('call rejected');
        switchMod(false);
    };
};
// JOINING A PEER /////////////////////////////////////////////////////////////// JOINING A PEER //
var og_call;
function joinPeer(evt, id){
    evt.preventDefault();
    let callOptions = {
                        metadata: `${localStorage.p_name}***${localStorage.p_bio}`,
                    };
    let remotePeersId = document.getElementById("room-input").value || id;
    console.log("Triying: " + remotePeersId);
    toast.log("Triying: " + remotePeersId);
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((l_stream) => {
            og_call = PeerConnection.call(remotePeersId, l_stream, callOptions);
            ongoing_call = og_call;
            setLocalStream(l_stream);
            var checker = setInterval(() => {
                if (og_call != undefined){
                    listenForStream(og_call);
                    clearInterval(checker);
                };
            }, 1000);
        }).catch(err => {
            console.error(err)
            toast.error(err)
        });
};
const listenForStream = () => {
    og_call.on('stream', (incoming_stream) => {
        toast.log('Connected!')
        setRemoteStream(incoming_stream);
        switchMod(true);
    });
    og_call.on('close', () => {
        toast.log('Call Closed.');
    });
    og_call.on('error', (e) => {
        console.log(e);
    });
};


// END ONGOING CALL
const endCall = () => {
    // end the call
    ongoing_call.close();
    switchMod(false);
};

/////////////////////////////////////////////////////////////

// ON LOAD
window.onload = () => {

};

/////////////////////////////////////////////////////////////

// SEND FEEDBACK
const sendFeedback = (evt, form) => {
    evt.preventDefault();
    let name = form[0].value,
        feedback = form[1].value,
        url = `https://wa.me/916282177960?text=Hi I'm ${name}. I've visited the Pico Meet site.${feedback}`;
    window.open(url);
};

// SUPABASE CLIENT MNGT ////////////////////////////////////////////////////////////// SUPABASE CLIENT MNGT //

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
                    // insert peer id to supa base
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



//getAllPeers()
                        
