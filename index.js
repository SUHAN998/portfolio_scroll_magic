// ==========================================================================
// 1. 인트로 시퀀스 및 메인화면 선명도 조절
// ==========================================================================
window.addEventListener('DOMContentLoaded', () => {
    const introLayer = document.getElementById('intro-layer');
    const homeSection = document.getElementById('home');

    // Welcome 글자가 사라지는 시점(약 3초 후)에 검은 배경 페이드 아웃 시작
    setTimeout(() => {
        if (introLayer) {
            introLayer.style.opacity = '0';
            
            // 배경이 완전히 투명해지면 레이어를 제거하고 메인화면 선명하게
            setTimeout(() => {
                introLayer.style.display = 'none';
                if (homeSection) homeSection.classList.add('reveal'); // 흐림 해제
            }, 1500); // CSS transition 시간(1.5s)과 맞춤
        }
    }, 3000); // 글자 애니메이션 시간과 맞춤
});


// ==========================================================================
// 2. 캔버스 배경 (별자리 유영 & 마우스 자석 효과)
// ==========================================================================
const canvas = document.getElementById('canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

if (canvas && ctx) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];

    // 마우스 설정 (밀어내는 반경) - 전역 통합 정의
    window.mouse = {
        x: null,
        y: null,
        radius: 180 
    };

    window.addEventListener('mousemove', function(event) {
        window.mouse.x = event.x;
        window.mouse.y = event.y;
    });

    // 창 밖으로 나갔을 때 마우스 위치 초기화
    window.addEventListener('mouseout', function() {
        window.mouse.x = null;
        window.mouse.y = null;
    });

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 2 + 1; // 점 크기 다양화

            // 물 같은 흐름을 위한 기본 속도 (아주 느리게)
            this.vx = (Math.random() - 0.5) * 0.3; 
            this.vy = (Math.random() - 0.5) * 0.3;

            this.density = (Math.random() * 30) + 1; // 자석 효과 무게감

            // 불규칙한 반짝임을 위한 속성
            this.opacity = Math.random(); 
            this.opacitySpeed = (Math.random() * 0.02) + 0.005; 
            this.flickerDirection = Math.random() > 0.5 ? 1 : -1; 
        }

        draw() {
            ctx.fillStyle = `rgba(220, 220, 255, ${this.opacity})`; 
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            // 아주 천천히 물처럼 이동
            this.x += this.vx;
            this.y += this.vy;

            // 화면 경계에 닿으면 튕기게
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // 불규칙한 반짝임 (투명도 조절)
            this.opacity += this.opacitySpeed * this.flickerDirection;
            if (this.opacity > 0.9 || this.opacity < 0.1) {
                this.flickerDirection = -this.flickerDirection; 
                this.opacitySpeed = (Math.random() * 0.02) + 0.005; 
            }

            // 마우스 자석 효과 (피하기)
            if (window.mouse.x != null && window.mouse.y != null) {
                let dx = window.mouse.x - this.x;
                let dy = window.mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < window.mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    
                    let maxDistance = window.mouse.radius;
                    let force = (maxDistance - distance) / maxDistance; 
                    let directionX = forceDirectionX * force * this.density * 0.6; 
                    let directionY = forceDirectionY * force * this.density * 0.6;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }
    }

    function init() {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 6000;
        
        for (let i = 0; i < numberOfParticles; i++) {
            let x = Math.random() * canvas.width;
            let y = Math.random() * canvas.height;
            particlesArray.push(new Particle(x, y));
        }
    }

    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 110) { 
                    let minOpacity = Math.min(particlesArray[a].opacity, particlesArray[b].opacity);
                    let lineOpacity = minOpacity * (1 - (distance / 110)) * 0.5; 

                    ctx.strokeStyle = `rgba(200, 200, 255, ${lineOpacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        connect();
        requestAnimationFrame(animate);
    }

    init();
    animate();

    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    });
}


// ==========================================================================
// 3. 메인 타이틀 마우스 반응 로직 (패럴랙스 무브먼트)
// ==========================================================================
const titleElement = document.querySelector('.title');
const subText = document.querySelector('.move-slow');
const mainText = document.querySelector('.move-fast');

window.addEventListener('mousemove', function(event) {
    // 마우스가 중앙에서 얼마나 떨어져 있는지 계산 (-0.5 ~ 0.5 사이)
    const xRel = (event.clientX / window.innerWidth) - 0.5;
    const yRel = (event.clientY / window.innerHeight) - 0.5;

    // 1) 메인 타이틀 기본 박스 움직임
    if (titleElement) {
        const moveX = xRel * 40; 
        const moveY = yRel * 40;
        titleElement.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    // 2) 내부 텍스트 입체 시차 움직임 (존재할 때만 실행하여 에러 차단)
    if (subText) subText.style.transform = `translate(${xRel * 20}px, ${yRel * 20}px)`;
    if (mainText) mainText.style.transform = `translate(${xRel * 50}px, ${yRel * 50}px)`;
});


// ==========================================================================
// 4. 스크롤 인터랙션 (홈 어둡게 필터링 & TOP 버튼 게이지 동기화)
// ==========================================================================
const arrowUpBtn = document.querySelector('.arrow-up');

window.addEventListener('scroll', function() {
    const home = document.getElementById('home');
    const scrollValue = window.scrollY;
    const windowHeight = window.innerHeight;

    // 1) 홈 화면 어둡게 만들기 (스크롤이 화면 높이의 30% 이상 내려가면)
    if (home) {
        if (scrollValue > windowHeight * 0.3) {
            home.classList.add('darken');
        } else {
            home.classList.remove('darken');
        }
    }

    // 2) Top 버튼 실시간 하늘색 테두리 게이지 동기화
    const progressCircle = document.querySelector('.arrow-up .progress-circle circle');
    if (progressCircle) {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) : 0;

        const totalLength = 289; // 반지름 46짜리 원의 총 둘레
        progressCircle.style.strokeDashoffset = totalLength - (totalLength * scrollPercent);
    }
});

// Top 버튼 클릭 시 부드럽게 최상단 스크롤
if (arrowUpBtn) {
    arrowUpBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


// ==========================================================================
// 5. 무한 반복 자동문 감시 로직 (IntersectionObserver 세팅)
// ==========================================================================
// ScrollMagic과 중복 충돌을 방지하면서 브라우저 기본 최적화 API로 자동문 완벽 제어
const sectionsList = document.querySelectorAll('section'); 

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // 화면에 50% 이상 보일 때 문을 열어둠 (.active 추가)
        if (entry.intersectionRatio >= 0.5) {
            entry.target.classList.add('active'); 
        } else {
            // 반 이상 벗어나면 즉시 리셋 (.active 제거)
            entry.target.classList.remove('active'); 
        }
    });
}, { 
    threshold: [0.5], 
    rootMargin: "0px"
});

sectionsList.forEach(sec => sectionObserver.observe(sec));


// ==========================================================================
// 6. 프로젝트 상세 모달 (데이터 구조 통합 및 슬라이더 원빌드화)
// ==========================================================================
const projectModal = document.getElementById('project-modal');

const projectData = {
    1: { 
        title: "7ELEVEN ReDesign", 
        images: ["images/ELEV1.png", "images/ELEV3.png"],
        colors: ["#EE3E3E", "#F37350", "#53BA61", "#FFE5CA"],
        codes: ["#EE3E3E", "#F37350", "#53BA61", "#FFE5CA"],
        desc: "올드한 인상을 줬던 기존 세븐일레븐의 CI를 현대적이고 친근한 콘셉으로 재해석한 프로젝트입니다.", 
        tools: "Illustrator, Photoshop"
    },
    2: { 
        title: "NAVER KiN ReDesign", 
        images: ["images/71.png", "images/72.png", "images/73.png"],
        colors: ["#2DB400", "#F8F8F8", "#D9D9D9"],
        codes: ["#2DB400", "#F8F8F8", "#D9D9D9"],
        desc: "지식인 서비스의 복잡한 레이아웃과 올드한 UI을 현대적 트렌드에 맞게 개선한 프로젝트 입니다.", 
        tools: "Figma, Illustrator, VSCode"
    },
    3: { 
        title: "Aladin ReDesign", 
        images: ["images/Aladin-RE.png", "images/Aladin-Sub1.png"], 
        colors: ["#EC3A95", "#FAA519", "#3A4A9E", "#F2F4FA"],
        codes: ["#EC3A95", "#FAA519", "#3A4A9E", "#F2F4FA"],
        desc: "UX/UI 측면에서 문제점이 많았던 알라딘 어플의 정보구조와 비주얼적 일관성을 개선한 프로젝트입니다.", 
        tools: "Figma, Illustrator"
    }
};

let currentImgIdx = 0;
let currentProjectImgs = [];

// 모달 열기 함수 (슬라이더 이미지 정보 + 텍스트 정보 완벽 결합)
function openDetail(id) {
    const data = projectData[id];
    if (!data || !projectModal) return;

    currentProjectImgs = data.images; // 현재 프로젝트의 이미지 배열 저장
    currentImgIdx = 0; // 이미지 인덱스 초기화

    // DOM 요소 매핑 및 데이터 삽입
    const mTitle = document.getElementById('modal-title');
    const mDesc = document.getElementById('modal-desc');
    const mImg = document.getElementById('modal-img');
    const mTools = document.getElementById('modal-tools');
    const colorContainer = document.getElementById('modal-colors');

    if (mTitle) mTitle.innerText = data.title;
    if (mDesc) mDesc.innerText = data.desc;
    if (mImg) mImg.src = currentProjectImgs[0];
    if (mTools) mTools.innerText = data.tools;
    
    // 컬러 팔레트 + 텍스트 코드 동시 생성
    if (colorContainer) {
        colorContainer.innerHTML = '';
        data.colors.forEach((color, idx) => {
            const item = document.createElement('div');
            item.className = 'color-item';
            item.innerHTML = `
                <div class="color-dot" style="background-color: ${color}"></div>
                <span class="color-code">${data.codes[idx]}</span>
            `;
            colorContainer.appendChild(item);
        });
    }

    // 모달 활성화 및 배경 스크롤 차단
    projectModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 이미지 슬라이더 변경 함수
function changeSlide(direction) {
    const mImg = document.getElementById('modal-img');
    if (!mImg || currentProjectImgs.length === 0) return;

    currentImgIdx += direction;
    if (currentImgIdx >= currentProjectImgs.length) currentImgIdx = 0;
    if (currentImgIdx < 0) currentImgIdx = currentProjectImgs.length - 1;
    
    mImg.src = currentProjectImgs[currentImgIdx];
}

// 모달 닫기 함수
function closeDetail() {
    if (projectModal) {
        projectModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // 배경 스크롤 복구
    }
}

// 배경(오버레이) 영역 클릭 시 자동으로 닫히는 기능
if (projectModal) {
    projectModal.addEventListener('click', (e) => {
        if (e.target === projectModal) closeDetail();
    });
}