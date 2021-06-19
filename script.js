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
    }

    //console.log();

};

// update setDetailForm on loading
var my_pid;
const setDetailForm = document.getElementById('setDetailForm');
        setDetailForm.name.value = localStorage.p_name || '';
        setDetailForm.peer.value = localStorage.p_pid || '';
        //.value = localStorage.p_pid || '';
        setDetailForm.bio.value = localStorage.p_bio || '';

// room creation vars
var room_id;
var getUserMedia = navigator.mediaDevices.getUserMedia;
const mediaConstrains = {
                        audio: {
                            echoCancellation: true
                        },
                        video: {
                            width: { ideal: 640},
                            height: { ideal: 360},
                            facingMode: { exact: "user" }
                        }
                    }
var local_stream, incoming_call;

// main model refs
const setupModal = document.querySelector('.setup')
const facetimeModal = document.querySelector('.facetime')

// room creation on load
function createRoom(){
    if (localStorage.p_pid && (localStorage.p_pid != (undefined || ''))){
        toast.log("Creating Room...");
        my_pid = localStorage.p_pid;

        let peer = new Peer('PICOMEET-' + my_pid);

        peer.on('open', (id)=>{
            // upload detail to base


            toast.log("Peer ID: " + id)
            getUserMedia(mediaConstrains).then((stream) => {
                                                        local_stream = stream;
                                                        setLocalStream(local_stream)
                                                    })
                                                    .catch(err => {
                                                        console.error(err)
                                                        toast.error(err)
                                                    });
            toast.log("Waiting for peer to join.")
        })

        peer.on('error', err => {
            console.error(err)
            toast.error(err)
        });

        peer.on('call',(call) => {
            // show incoming call
            let browser = call.options._payload.browser,
                incoming_peer =  call.peer,
                div = document.createElement('div');
            div.setAttribute('id', 'incoming');
            div.innerHTML = `<div class="call_info">
                                <p>INCOMING CALL FROM PEER</p>
                                <h2>${incoming_peer}</h2>
                                <p>incoming from ${browser} browser</p>
                            </div>
                            <div class="call_btns">
                                <button onclick="answer(false, this)">reject</button>
                                <button onclick="answer(true, this)">answer</button>
                            </div>`;
                            facetimeModal.style.display = 'block';
                            setupModal.style.display = 'none';
            incoming_call = call;
            facetimeModal.appendChild(div)
        });
    } else {
        setDetailForm.scrollIntoView()
    }
};
                // calling to create room with ls pid
                createRoom();

// answering call
const answer = (didAnswer, modal) => {
    if (didAnswer){
        toast.log('accepting all')
        incoming_call.answer(local_stream);
        incoming_call.on('stream',(stream)=>{
            facetimeModal.style.display = 'block';
            setupModal.style.display = 'none';
            setRemoteStream(stream)
        });
        modal.parentElement.parentElement.remove()
    } else if (!didAnswer){
        toast.log('call rejected');
        modal.parentElement.parentElement.remove()

    }
}

// joing a room
function joinRoom(){
    toast.log("Joining Room...")

    let room = document.getElementById("room-input").value;

    if(room == " " || room == "")   {
        alert("Please enter room number")
        return;
    }

    room_id = 'PICOMEET-' + room;

    let peer = new Peer();

    peer.on('open', (id) => {
        toast.log("Peer ID: " + id)
        getUserMedia(mediaConstrains).then((stream) => {
                                                    local_stream = stream;
                                                    setLocalStream(local_stream);
                                                    toast.log("Joining peer");

                                                let call = peer.call(room_id, stream);

                                                    call.on('stream', (stream)=>{
                                                        facetimeModal.style.display = 'block';
                                                        setupModal.style.display = 'none';
                                                        setRemoteStream(stream);
                                                    })
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

}


// setting streams to dom
function setLocalStream(stream){
    let video = document.getElementById("local-video");
    video.srcObject = stream;
    video.muted = true;
    video.play();
}
function setRemoteStream(stream){
    let video = document.getElementById("remote-video");
    video.srcObject = stream;
    video.play();
}


/* chat */
const msgBlk = document.querySelector('.messages')
const message = (e, form) => {
    e.preventDefault()
    let msg  = form[0].value,
        li = document.createElement('li');
        li.classList.add('sended');
        li.innerText = msg;
    msgBlk.appendChild(li)

    // send to other peer

}

/* local video toggler */
const toggleVid = () => {
    let vid = document.getElementById('local-video'),
        displayState = getComputedStyle(vid).display;
    if (displayState == 'block'){
        vid.style.display = "none";
    } else if (displayState == 'none'){
        vid.style.display = 'block'
    }
}

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

// call to get onload
//getAllPeers()
