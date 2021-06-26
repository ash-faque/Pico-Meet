// TOASTER OBJ
var toastBlck = document.getElementById("toast");
const toast = {
    log: (msg) => {
            let p = document.createElement('p');
            p.classList.add('log');
            p.innerHTML = msg;
            toastBlck.prepend(p);
            setTimeout(()=>{
                p.remove();
            }, 3000);
        },
    error: (msg) => {
            let p = document.createElement('p');
            p.classList.add('error');
            p.innerHTML = `<span>${msg}</span><span onclick="this.parentElement.remove()">x</span>`;
            toastBlck.prepend(p);
            let current_errs_count = Array.from(toastBlck.querySelectorAll('.error')).length;
            if (current_errs_count > 3){
                document.getElementById('cleaner').style.display = 'block';
            };
        },
    clearAllErrors: (cleaner) => {
        let errors = Array.from(toastBlck.querySelectorAll('.error'));
        errors.forEach(error => {
            error.remove();
        });
        cleaner.style.display = 'none';
        fab();
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
// CUSTOM TAB OPENERS
const openTab = (tabId) => {
    let tab = document.getElementById(tabId);
    let tab_d_state = getComputedStyle(tab).display;
    if (tab_d_state == 'block'){
        tab.style.display = 'none';
    } else if (tab_d_state == 'none'){
        tab.style.display = 'block';
    };
    fab();
};
// BACK ON CUSTOME TABS
const toRoot = () => {
    let custom_tabs = Array.from(document.querySelectorAll('.ct'));
    custom_tabs.forEach(ct => ct.style.display = 'none');
    fab();
};
// L VID TOGGLER
const toggleVid = () => {
    let vid = document.getElementById('local-video'),
        vid_d_state = getComputedStyle(vid).display;
    if (vid_d_state == 'block'){
        vid.style.display = 'none';
    } else if (vid_d_state == 'none'){
        vid.style.display = 'block';
    };
};
// FAB BUTTON
const fab = () => {
    let fab_open_state = getComputedStyle(document.querySelector('.fab_elms')).display;
    if (fab_open_state == 'block'){
        document.querySelector('.fab_elms').style.display = 'none';
        document.querySelector('.fab_switcher').innerText = '💣';
        document.querySelector('.fab_switcher').style.borderTopRightRadius = '50%';
        document.querySelector('.fab_switcher').style.borderTopLeftRadius = '50%';
    } else if (fab_open_state == 'none'){
        document.querySelector('.fab_elms').style.display = 'block';
        document.querySelector('.fab_switcher').innerText = '💥';
        document.querySelector('.fab_switcher').style.borderTopRightRadius = '0';
        document.querySelector('.fab_switcher').style.borderTopLeftRadius = '0';
        document.addEventListener('click', (e) => {
            let fab = document.querySelector('.fab');
            if (e.target != fab && !fab.contains(e.target)){
                document.querySelector('.fab_elms').style.display = 'none';
                document.querySelector('.fab_switcher').innerText = '💣';
                document.querySelector('.fab_switcher').style.borderTopRightRadius = '50%';
                document.querySelector('.fab_switcher').style.borderTopLeftRadius = '50%';
            };
        });
    };
};
// VID CONTROL
const vidControl = (controllerBtn) => {
    let v_control_wrap = document.querySelector('.v_control_wrap');
    let controls_d_state = getComputedStyle(v_control_wrap).display;
    if (controls_d_state == 'block'){
        v_control_wrap.style.display = 'none';
        controllerBtn.style.filter = 'grayscale(0)';
    } else if (controls_d_state == 'none'){
        v_control_wrap.style.display = 'block';
        controllerBtn.style.filter = 'grayscale(1)';
        document.addEventListener('click', (e) => {
            let call_controls = document.querySelector('.call_controls');
            if (e.target != call_controls && !call_controls.contains(e.target)){
                v_control_wrap.style.display = 'none';
                controllerBtn.style.filter = 'grayscale(0)';
            };
        });
    };
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
// HIDE SPLASH SCREEN
const splashScreen = document.querySelector('.splash')
const hideSplashScreen = () => {
    splashScreen.style.display = 'none'
};


// SET INFO MNGR //////////////////////////////////////////////////////////////////////////////////// SET INFO MNGR //
const setDetailForm = document.getElementById('setDetailForm');
var pInfo = {};                     // ALSO USING IN DB
const setDetails = (e, setDetailForm) => {
    e.preventDefault();
    let stored_pid = '',
        pid_changed = false;
    (localStorage.p_pid != undefined) ? stored_pid = localStorage.p_pid : stored_pid = '';
    pInfo = {
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
        connectToPeerServer();
    };
    toast.log('Details saved.');
    toRoot();
};

// ONLOAD
window.onload = () => {
    if (localStorage.p_pid == undefined){
        openTab('collect_detail');
    } else {
        pInfo.p_name = localStorage.p_name;
        pInfo.p_pid = localStorage.p_pid;
        pInfo.p_bio = localStorage.p_bio ;
    };
    try {
        // RETRIEVE INFO OBJ FRM LS && LOCATION HASH
        setDetailForm.name.value = localStorage.p_name || '';
        setDetailForm.peer.value = localStorage.p_pid || '';
        setDetailForm.bio.value = localStorage.p_bio || '';
        document.getElementById('room-input').value = location.hash.slice(1);
    } catch {(err) => toast.error(err)};
};
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

/////////////////////////////////////////////////////////////

// SEND FEEDBACK
const sendFeedback = (evt, form) => {
    evt.preventDefault();
    toRoot();
    let name = form[0].value,
        feedback = form[1].value,
        url = `https://wa.me/916282177960?text=Hi I'm ${name}. I've visited the Pico Meet site.${feedback}`;
    window.open(url);
};

// INVITE BTN
const invite = () => {
    if (PeerConnection.open){
        let shareData = {
                title: 'Invitation to Pico Meet.',
                text: `${localStorage.p_name ? localStorage.p_name : "I've"} invited you to joing a one-to-one video call. Cum oon ma baay!`,
                url: `https://pico-meet.netlify.app#${PeerConnection.id}`,
            };
        if (navigator.share){
            navigator.share(shareData)
                    .then(() => toast.log('Invitated.'))
                    .catch((error) => toast.log('Invitation failed', error));
        } else {
            toast.log('The native share feature is not implemented in browser.');
        };
    } else {
        toast.log('Connecting to peer server first.');
    };
    fab();
};


// PEER CONNECTING TO SERVER /////////////////////////////////////////////////////////////// PEER CONNECTING TO SERVER //

var in_call; 
var ongoing_call;       // FOR ENDING CALL
var JOINABLE = true;    // JOINBLE STATE
var PeerConnection;

const connectToPeerServer = () => {
    let storedPidFrmLs = '';
    (localStorage.p_pid && (localStorage.p_pid != '')) ? storedPidFrmLs = localStorage.p_pid : '';
    toast.log('Connecting with id: ' + storedPidFrmLs);
    PeerConnection = new Peer(storedPidFrmLs);
    PeerConnection.on('error', err => {
        console.error(err.type);
        // delet un responsive id from db
        if (err.type == 'peer-unavailable'){
            deletePeer(id_tried_just_now);
        };
        toast.error(err);
        // HIDE SPLASH SCREEN
        hideSplashScreen();
        let peer_status_d = document.querySelector('.connected'),
            peer_id_d = document.querySelector('.with_id');
        peer_status_d.innerText = 'Error ❌';
        peer_id_d.innerText = 'No connection? No ID 💔';
        peer_status_d.style.color = 'red';
        peer_id_d.style.color = 'red';
    });
    let peer_est_watcher = setInterval(() => {
        if (PeerConnection != undefined){
            listenForPeerEvents();
            clearInterval(peer_est_watcher);
        };
    }, 1000);
};

connectToPeerServer();

const listenForPeerEvents = () => {
    let peer_state_watcher;
    PeerConnection.on('open', (id) => {
        console.log(id);
        toast.log('Connected with id: ' + id);
        // HIDE SPLASH SCREEN
        hideSplashScreen();
        regOnDB();
        // LISTEN FOR STATE UPDATION OF PEER
        peer_state_watcher = setInterval(() => {
            let peer_status_d = document.querySelector('.connected'),
                peer_id_d = document.querySelector('.with_id'),
                force_connect = document.getElementById('force_connect');
            if (PeerConnection.open){
                peer_status_d.innerText = 'Connected ✔';
                peer_id_d.innerText = PeerConnection.id;
                peer_status_d.style.color = '#4cd34c';
                peer_id_d.style.color = '#4cd34c';
                force_connect.style.display = 'none';
            } else {
                peer_status_d.innerText = 'Disconnected ❌';
                peer_id_d.innerText = 'No connection? No ID 💔';
                peer_status_d.style.color = 'red';
                peer_id_d.style.color = 'red';
                force_connect.style.display = 'block';
                clearInterval(peer_state_watcher);
            };
        }, 1000);
    });
    PeerConnection.on('call', (call) => {
        toast.log('incoming....');
        in_call = call;
        let incoming_peers_info = in_call.metadata.split('***');
        // show incoming call popup
        let div = document.createElement('div');
        div.setAttribute('id', 'incoming');
        div.innerHTML = `<div class="call_info">
                            <p>AUTO ANSWERING IN: <span id="eta_auto_ans"></span> SECONDS</p>
                            <span>INCOMING CALL FROM:</span>
                            <h3>${incoming_peers_info[0]}</h3>
                            <p>${incoming_peers_info[1]}</p>
                        </div>
                        <div class="call_btns">
                            <button onclick="answer(false, this)">reject</button>
                            <button id="auto_ans" onclick="answer(true, this)">answer</button>
                        </div>`;
        setupModal.appendChild(div);
        let waiting_time = 10; // Seconds to wait for auto answering
        let eta_display = document.getElementById('eta_auto_ans');
        eta_display.innerText = waiting_time;
        let eta_to_ans = setInterval(() => {
                waiting_time = waiting_time - 1;
                eta_display.innerText = waiting_time;
            }, 1000);
            setTimeout(() => {
                let ans_btn = document.getElementById('auto_ans');
                ans_btn ? ans_btn.click() :
                clearInterval(eta_to_ans);
            }, 1000 * waiting_time);
    });
};

// ASWERING CALL BLK
const answer = (didAnswer, modal) => {
    if (didAnswer){
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((l_stream) => {
            in_call.answer(l_stream);
            setLocalStream(l_stream);
            switchMod(true);
            ongoing_call = in_call;
            in_call.on('stream', (incoming_stream) => {
                setRemoteStream(incoming_stream);
                JOINABLE = false;
            });
            in_call.on('close', () => {
                toast.log('Call rejected');
            });
            in_call.on('error', (e) => {
                console.log(e);
            });
        }).catch(err => {
            console.error(err)
            toast.error(err)
        });
    } else if (!didAnswer){
        in_call.close();
        switchMod(false);
    };
    modal.parentElement.parentElement.remove();
};

    
// JOINING A PEER /////////////////////////////////////////////////////////////// JOINING A PEER //
var id_tried_just_now;
var og_call;
var join_freez_time = (12*1000);   // FREEZ TIME
const freez_t_d = document.getElementById('freez_time');    // freez action prompt

function joinPeer(id, evt){
    if (evt){ evt.preventDefault(); };
    let callOptions = {
                        metadata: `${localStorage.p_name}***${localStorage.p_bio}`,
                    };
    if (JOINABLE && PeerConnection.open){
        toast.log("Triying: " + id);
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((l_stream) => {
                og_call = PeerConnection.call(id, l_stream, callOptions);
                setLocalStream(l_stream);
                var checker = setInterval(() => {
                    if (og_call != undefined){
                        JOINABLE = false;
                        freez_t_d.style.display = 'block';
                        let entryM = document.getElementById('entry-modal'),
                            explorerT = document.getElementById('peer_explorer');
                        entryM.style.filter = 'grayscale(1)';
                        explorerT.style.filter = 'grayscale(1)';
                        setTimeout(() => {
                            JOINABLE = true;
                            freez_t_d.style.display = 'none';
                            entryM.style.filter = 'grayscale(0)';
                            explorerT.style.filter = 'grayscale(0)';
                        }, join_freez_time);
                        listenForStream(og_call);
                        id_tried_just_now = id;
                        clearInterval(checker);
                    };
                }, 1000);
            }).catch(err => {
                console.error(err)
                toast.error(err)
            });
    } else {
        toast.log("Not joinable at the moment.");
    };
   
};

// OUTGOING CALL EVT LISTENER
const listenForStream = () => {
    og_call.on('stream', (incoming_stream) => {
        toast.log('Connected!');
        ongoing_call = og_call;
        setRemoteStream(incoming_stream);
        switchMod(true);
    });
    og_call.on('close', () => {
        JOINABLE = true;
        toast.log('Call Closed.');
    });
    og_call.on('error', (e) => {
        JOINABLE = true;
        console.log(e);
    });
};

// END ONGOING CALL
const endCall = () => {
    // end the call
    ongoing_call.close();
    switchMod(false);
    JOINABLE = true;
};



///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FIREBASE CLIENT MNGT /////////////////////////////////////////////////////////////////////////// FIREBASE CLIENT MNGT //
const ACTIVE_PEERS = DB.collection('active-peers');

// REG ON DB
const regOnDB = () => {
    if (PeerConnection.open){
        ACTIVE_PEERS.doc(PeerConnection.id).set({ 
                                            name: pInfo.p_name || 'Anounymous.',
                                            bio: pInfo.p_bio || 'Not available.',
                                            lpt: firebase.firestore.Timestamp.now()
                                        })
                                    .then(() => console.log('Entered to db.'))
                                    .catch(e => console.error(e));
    };
};

// LISTEN FOR DOC CHANGES
const listenToActivePeers = (btn) => {
    btn.remove();
    ACTIVE_PEERS.onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            let dataObj = change.doc.data(),
                docId = change.doc.id;
            if (change.type == 'added'){
                renderActivePeers(dataObj, docId);
            } else if (change.type == 'removed'){
                let li = document.getElementById(docId);
                li.remove();
            };
        });
    });
};

// DELETER FN
const deletePeer = (targetId) => {
    ACTIVE_PEERS.doc(targetId).delete()
                                .then(() => console.log('Deleted doc.'))
                                .catch(e => console.error(e));
};

// INCOMING DATA RENDER FN
const renderActivePeers = (peersData, docId) => {
    if (docId == PeerConnection.id){
        return;
    };
    let p_name = peersData.name,
        bio = peersData.bio,
        lpt = peersData.lpt.toDate().getTime(),
        ct = new Date().getTime(),
        eta = Math.round((ct - lpt) / 60000);
        console.log(eta)
    let li = document.createElement('li');
    li.setAttribute('id', docId);
    li.innerHTML = `<p class="name">${p_name}
                        <span class="lpt">${eta} minutes ago.</span>
                    </p><p class="bio">${bio}</p>
                    <p class="join_btn" onclick="joinPeer('${docId}')">Try To Call This Peer.</p>`;
    let parentUl = document.getElementById('explore');
    parentUl.appendChild(li);
};