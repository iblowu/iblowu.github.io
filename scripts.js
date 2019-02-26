$(document).ready(function () {
    const ed = document.querySelector('#edpic');
    const body = document.querySelector('body');
    const gachi = document.querySelector('#gachi');
    const ungachi = document.querySelector('#ungachi');
    const billy = document.querySelector('#billypic');
    const ricardo = document.querySelector('video');
    const gachibuttons = document.querySelectorAll('.gachibutton');
    const anygachibutton = document.querySelector('.maingachi');
    const containers = document.querySelectorAll('.h2container');
    const h2newcontainers = document.querySelectorAll('.h2container button.new ');
    const opacaffectedel = document.querySelectorAll('.h2container button, .h2container h2, h1, #logo, .navbar ');

    var gachistate = 0;

    function webpage_start() {

        $("#gachiboard").show(2000);
        $("#gachi").animate({ left: 800 / 2 - $("#gachi").width() / 2 }, 2000);

        $('a[href*="#"]')
        .not('[href="#"]')
        .not('[href="#0"]')
        .click(function (event) {
            if (
            location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
            &&
            location.hostname == this.hostname
            ) {
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    event.preventDefault();
                    $('html, body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                }
            }
        });

        $("#edpic").mouseenter(function () {
            $("#edpic").animate({
                left: "-=50px"
            }, "slow"
            );
        });
        $("#edpic").mouseleave(function () {
            $("#edpic").animate({
                left: "+=50px"
            }, "slow"
            );
        });

    }

    function add_gachi(e) {
        $("#gachi").css('opacity', 0.5);
        $("#gachi").slideUp(2000, function () {

            ricardo.play();
            ricardo.setAttribute('style', 'display:fixed');
            body.classList.remove('unricardo');
            body.classList.add('ricardo');
            body.setAttribute('style', 'color:white;');

            opacaffectedel.forEach(function (el) {
                el.classList.add('lowopacity');
                el.classList.remove('highopacity');
            });

            $("#ungachi").slideDown(1000);
            billy.setAttribute('style', 'display:block');
            billy.classList.remove('vibrate-2');
            billy.classList.add('fade-in');
            ed.classList.remove('slide-left');
            ed.classList.add('slide-right');

            setTimeout(function () {
                document.getElementById('a100002').play();
            }, 3000);

            containers.forEach(function (container) {
                container.classList.toggle('noborder');
            });

            gachibuttons.forEach(function (button) {
                button.setAttribute('style', 'display:block;');
                button.classList.add('swing-in-top-fwd');
                button.classList.remove('swing-out-top-bck');
            });
            gachistate = 1;

        });
    }

    function play_music(e) {
        const audio = document.querySelector(`audio[data-key="${e.keyCode}"]`);
        const key = document.querySelector(`.gachibutton[data-key="${e.keyCode}"]`);
        if (!audio)
            return;
        if (gachistate)
        {
            audio.currentTime = 0;
            audio.play();
            key.classList.add('gachipressed');
        }
    }

    function mute_ricardo(e) {
        if (ricardo.muted === true)
            ricardo.muted = false;
        else
            ricardo.muted = true;
    }

    function start_gachi_removal(e) {
        document.getElementById('a100001').play();
        $("#ungachi").slideUp(1000, function () {
            gachibuttons.forEach(function (button) {
                button.classList.add('swing-out-top-bck');
                button.classList.remove('swing-in-top-fwd');
            });  
        });
    }

    function remove_gachi(e) {
        if (e.animationName === "swing-out-top-bck") {

            gachibuttons.forEach(function (button) {
                button.setAttribute('style', 'display:none');
            });

            billy.classList.remove('fade-in');
            billy.classList.add('vibrate-2');
            setTimeout(function(){
                billy.setAttribute('style', 'display:none');
            },6000);
            $("#gachi").slideDown(2000, function () {

                opacaffectedel.forEach(function (el) {
                    el.classList.remove('lowopacity');
                    el.classList.add('highopacity');
                });

                containers.forEach(function (container) {
                    container.classList.toggle('noborder');
                });

                billy.classList.toggle('fade-in');
                ricardo.muted = true;
                ricardo.pause();
                ricardo.setAttribute('style', 'display:none');
                body.setAttribute('style', 'color:black;');
                body.classList.remove('ricardo');
                body.classList.add('unricardo');

                ed.classList.remove('slide-right');
                ed.classList.add('slide-left');
                
                gachistate = 0;
            });
        }
    }

    webpage_start();

	setInterval(function () {
		h2newcontainers.forEach(function (h2newcontainer) {
			h2newcontainer.classList.toggle('active');
		});
	}, 1000);

	gachi.addEventListener('click', add_gachi);
	document.addEventListener('keydown', play_music);
	billy.addEventListener('click', mute_ricardo);
	gachibuttons.forEach(function (button) {
	    button.addEventListener('transitionend', function (e) {
	        this.classList.remove('gachipressed');
	    });
	});
	ungachi.addEventListener('click', start_gachi_removal);
	anygachibutton.addEventListener('webkitAnimationEnd', remove_gachi);


});