
//함수 (1) : tab[0] 페이지(url)로 injected 되는 함수//////////////////////////////////////////////////
function injected(){
  // window.location.reload();
  let url = window.location.href;

  let list,imgSource,title,jump;
  //재생목록의 서브페이지 URL의 경우
  if(url.indexOf('&list')!= -1){
    //list = document.querySelectorAll('#container #items #playlist-items #text');
    //imgSource = document.querySelector('#container #thumbnail-container #thumbnail img').getAttribute('src');
    title = document.querySelector('#container #header-description a').innerText;
    jump = 1;
    list = document.querySelectorAll('#content #playlist-items #wc-endpoint #overlays #text');
    imgSource = document.querySelector('#content #container #thumbnail-container #thumbnail img').getAttribute('src');
  }
  //재생목록의 메인페이지 URL의 경우
  else if(url.indexOf('playlist?list')!= -1){
    list = document.querySelectorAll('.ytd-playlist-video-list-renderer .ytd-playlist-video-list-renderer #text');
    imgSource = document.querySelector('#contents #thumbnail .yt-core-image--loaded').getAttribute('src');
    title = document.querySelector('.style-scope ytd-browse .style-scope ytd-playlist-sidebar-primary-info-renderer #title a');
    if (title != null ) title = title.innerText;
    else{
      title = document.querySelector('.immersive-header-content #container #text');
      if(title != null) title = title.innerText;
      else title ="Preliminary Video Title";
    }
    jump = 2;
  }
  else{
    console.log(false);
  }
  console.log(list);
  console.log(imgSource);
  console.log(title);

  //"00:00" 형식으로 크롤링한 문자열 배열을 ':'으로 나눈 뒤 누적한다
  let hour=0,min=0,sec=0,check=0;

  for(var i=0; i<list.length ;i=i+jump){
      let pieces = list[i].innerText.split(':');
      console.log(pieces)
      if(pieces.length>2){
          hour += parseInt(pieces[0]);
          min += parseInt(pieces[1]);
          sec += parseInt(pieces[2]);
      }
      else{
          min += parseInt(pieces[0]);
          sec += parseInt(pieces[1]);
      }
      console.log(hour, min, sec)
      check ++;
  };

  let addedSec = hour*60*60 + min*60 + sec;

  console.log('addedSec : '+ addedSec);

  //alert(" 현재 페이지 에서는 200개의 영상 까지만 계산할 수 있습니다. 재생목록의 제목을 눌러 재생목록 메인페이지로 이동해 주세요 :)")
  
  if(url.indexOf('&list')!= -1 && check==200){
    title ="현재 페이지 에서는 200개의 영상 까지만 로드할 수 있습니다. 재생목록의 제목을 눌러 재생목록 메인페이지로 이동해 주세요 :)"
  }
  if (imgSource==null){
    window.location.reload();
  }

  return [addedSec,check,imgSource,title];
  //함수1(injected)는 [누적초,비디오개수,썸네일주소,제목]배열을 반환한다.
}

function fullTime(totalSec){
  var Fhour = Math.floor(totalSec/(60*60));
  var Fmin = Math.floor((totalSec%(60*60))/60);
  var Fsec = Math.floor((totalSec%(60*60))%60);
  var message = Fhour + "시간 " + Fmin + "분 " + Fsec +"초";
  return message;
}
//함수2 popup에서 실행되는 함수
// url에 injected()함수를 넣고 반환되는 배열을 res에 저장
async function makeResult() {
  // window.location.reload();
  const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  let res;
  try {
    res = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: injected

    });
  } catch (e) {
    console.warn(e.message || e);
    return;
  }

  //반환되는 배열 res[0].result 를 사용해 popup.html 로 삽입되는 코드
  for (var i=0;i<4;i++){
    console.log(res[0].result[i]);
  }
  
 
  var res0Result = res[0].result;
  
  var addedSec = res0Result[0];
  var addedSec1_25 = res0Result[0]/1.25;
  var addedSec1_5 = res0Result[0]/1.5;
  var addedSec1_75 = res0Result[0]/1.75;
  var addedSec2 = res0Result[0]/2;
  var check2 = res0Result[1];

  result ="Total : " + fullTime(addedSec)
    + "\nx1.25 : " + fullTime(addedSec1_25)
    + "\nx1.5  : " + fullTime(addedSec1_5)
    + "\nx1.75 : " + fullTime(addedSec1_75)
    + "\nx2.0    : " + fullTime(addedSec2)
    //+ "\nCounted Video : " + check2;

  document.querySelector("#result").innerText = result;
  document.querySelector(".countnum").innerText = res0Result[1];
  document.querySelector(".img").setAttribute('src',res0Result[2]);
  // let videoTitle = res0Result[3];
  //let nbsp = '\u00A0'.repeat(7);
  // document.querySelector(".video_title").innerText = videoTitle;
  document.querySelector(".background").style.opacity ='0%';
  document.querySelector(".shadow").style.opacity ='75%';
  document.querySelector(".video_title_box").style.top = '5px';
  document.querySelector(".img").style.top = '-118px';
  const title =document.querySelector('.video_title');
  if (res0Result[3] =="현재 페이지 에서는 200개의 영상 까지만 로드할 수 있습니다. 재생목록의 제목을 눌러 재생목록 메인페이지로 이동해 주세요 :)"){
    document.querySelector(".video_title").style.color = 'crimson';
  }

 // video_title animation code //
  function textMultiply(text,times){
    let t = text
    for (i=0 ;i<times-1;i++){
        t +=text;
    }
    return t
  }

  let titleTextPart1 = res0Result[3];
  let space;

  if (titleTextPart1.length<6) space= 15;
  else if(titleTextPart1.length<10) space= 10;
  else space= 6;
  
  let titleTextPart2 = textMultiply('\u00A0',space)
  let titleText = titleTextPart1 + titleTextPart2;

  function initTexts(elements,text) {
      elements.innerText = text+text+text+text+text+text;
  }

  initTexts(title,titleText);

  let count = 0;
  function backText(count, element,direction) {
    if (count > element.scrollWidth / 6) {
        element.style.transform ='translateX(0)'
        count = 0;
    }
    element.style.transform =`translateX(${count*direction}px)`
    return count
  }

  function animate() {
    count++
    count = backText(count,title,-1);
    window.requestAnimationFrame(animate);
  }
  animate();
}

//함수2 실행 !
makeResult();

///////////////////////////////////////////////////////////////////////////////////
