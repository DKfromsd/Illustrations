'use strict';

const featTitle = `Why Choose Pen from the North West?`;

const feat1Title = `Classic FineArt<br/> Modern Comics`;
const feat1Desc = `
  At Pen from the North West, we understand the unique style of each children's book that the writer wants to present. Authentic scent from the writing that inexperienced designer's artworks cannot align with, can be ensured by our process and solutions so that your writings can be visualized to childrens with the style you want to present.<br/> That's why we are committed to helping independent writers.
`;

const feat2Title = `Free Consultation for Beginner Writers`;
const feat2Desc = `We offer expert consultations on best practices, specifically tailored for custom styles. Our free consultation service is designed to provide you with accessible, practical, and effective process to publish your writings. Whether you're just starting to build your writer careers for children's books or need to migrate your preproduction to commercial publish, our experienced professionals are here to guide you.`;

const feat3Title = `Zero Consultation Costs`;
const feat3Desc = `
    Yes! We really mean <span class='tile-text-bold'>"Free"</span><br/><br/>
    We guide you through the process of publish <span class='tile-text-bold'>books</span> and  <span class='tile-text-bold'>reliable</span> web hosting. Once we deliver your writings.<br/><br/>
    The only optional ongoing expense is the maintenance cost upon change requests (around $120 per piece).
`;

const fillStaticText = () => {
  const phrase1Arr = phrase1.split(' ');
  getEl('js-title').innerHTML = phrase1;
  getEl('js-main-title').innerHTML = `${phrase1Arr[0]}<br/>${phrase1Arr[1]} ${phrase1Arr[2]}<br/>${phrase1Arr[3]}`;
  //getEl('js-main-title').innerHTML = `Childrend's Books Illustration`;
  // getEl('js-main-desc').innerHTML = mainDesc;
  getEl('js-feat1-title').innerHTML = `${feat1Title}<br/>`;
  getEl('js-feat2-title').innerHTML = `${feat2Title}<br/>`;
  // getEl('js-feat3-title').innerHTML = `${feat3Title}<br/>`;
  getEl('js-notice-success').innerHTML = messageSuccess;
  getEl('js-notice-err').innerHTML = messageFail;
  getEl('js-feat-title').innerHTML = featTitle;
  getEl('js-feat1-desc').innerHTML = feat1Desc;
  getEl('js-feat2-desc').innerHTML = feat2Desc;

  getEl('js-contact-desc').innerHTML = `Getting started with Pen from the North West's Children's Books is easy. Please feel free to contact us directly at <a href='mailto:${email}'>${email}</a> `; // or ${phone} `;

  // getEl('js-contact-form').innerHTML = `<div class="contact-form-row">
  //   <div class="contact-form-text">
  //     <input type='off' class='form-textbox-input' id='name' name='name' autocomplete='nope' placeholder='Your name' required aria-label='Enter name'>
  //   </div>
  //   <div class='contact-form-sp'></div>
  //   <div class="contact-form-text">
  //     <input type='email' class='form-textbox-input' id='email' name='email' autocomplete='off' placeholder='Email address' required aria-label='Enter email'>
  //   </div>
  //   <div class='contact-form-sp'></div>
  //   <div id='js-contact-select' class="contact-form-text form-dropdown dropdown-fader">
  //     <select class="form-textbox-input form-dropdown-select" data-ignore-tracking="true" id="js-form-service" aria-labelledby="services-dropdown_label">
  //       <option disabled selected="" value="">Select a service type</option>
  //       <option class="services-dropdown-item" value="Starter Kit">Free Consulting</option>
  //       <option class="services-dropdown-item" value="Consulting">Change Supports</option>
  //       <option class="services-dropdown-item" value="Others">Others</option>
  //     </select>
  //   </div>
  // </div>
  // <textarea placeholder="Please briefly explain your needs." class="form-textbox-input contact-form-textarea" name="message" rows="10" required></textarea>
  // <button type='submit' class='button-blue'>Send your request</button>
  // `;

  getEl('js-footer').innerHTML = `© 2025 ${phrase1}`;
}

const renderBanner = async () => {
  await initBanner(0);

  const phraseArr = phrase1.split(' ');
  moveCaret('js-type-01');
  await elapseTime(500);
  getEl('js-header').scrollIntoView();
  await elapseTime(1500);

  await typeText('js-type-01', phraseArr[0], 70);
  await elapseTime(300);
  getEl('js-space-01').classList.remove('hidden');
  // getEl('js-next-01').classList.remove('hidden');
  if (isMobile())getEl('js-next-01').classList.remove('hidden'); 
  
  await typeText('js-type-02', phraseArr[1], 100);
  getEl('js-space-02').classList.remove('hidden');
  getEl('js-next-02').classList.remove('hidden');
  
  await typeText('js-type-03', phraseArr[2], 100);
  getEl('js-space-03').classList.remove('hidden');
  // if (isMobile())getEl('js-next-02').classList.remove('hidden'); 
  getEl('js-next-03').classList.remove('hidden');
  
  await typeText('js-type-04', phraseArr[3], 40);
  getEl('js-space-04').classList.remove('hidden');
  getEl('js-next-04').classList.remove('hidden');
  
  blinkCaret(true);
  getEl('js-main-img-1').classList.add('bw-opacity-trans');
  await elapseTime(2500); // 2000 to 2500

  // await selectText('js-type-01', 50);
  // await elapseTime(1000);
  // getEl('js-type-01').innerHTML = '';
  // moveCaret('js-type-01');
  // blinkCaret(false);
  // await elapseTime(100);
  // getEl('js-type-01').classList.add('text-subhead');
  // await typeText('js-type-01', phrase2.split(' ')[0], 30);

  // await selectText('js-type-03', 50);
  // await elapseTime(1000);
  // getEl('js-type-03').innerHTML = '';
  // moveCaret('js-type-03');
  // blinkCaret(false);
  // await elapseTime(100);
  // getEl('js-type-03').classList.add('text-subhead');
  // await typeText('js-type-03', phrase2.split(' ')[2], 30);
  // blinkCaret(true);
  // await elapseTime(1500);
   
  await initBanner(100); // 0 to 100
  
  if (!isMobile()) getEl('js-banner-wr').style.lineHeight = 2;
  
  const phrase3Arr = phrase3.split(' ');
  moveCaret('js-type-01');
  // Set phrase3 to white
  getEl('js-type-01').style.color = '#fff';
  await typeText('js-type-01', phrase3Arr[0], 100);
  getEl('js-space-01').classList.remove('hidden');
  if (isMobile())getEl('js-next-01').classList.remove('hidden');
  
  getEl('js-type-02').style.color = '#fff';
  await typeText('js-type-02', phrase3Arr[1], 100);
  getEl('js-space-02').classList.remove('hidden');
  if (isMobile())getEl('js-next-02').classList.remove('hidden'); 
  
  getEl('js-type-03').style.color = '#fff';  
  await typeText('js-type-03', phrase3Arr[2], 100);
  getEl('js-space-03').classList.remove('hidden');
  await elapseTime(1000);
  await selectText('js-type-03', 50);
  await elapseTime(1000);

  getEl('js-type-03').innerHTML = '';
  moveCaret('js-type-03');
  blinkCaret(false);


  hideCaret();
  // Set phrase4 to white
  getEl('js-type-03').style.color = '#fff';//getEl('js-type-03').style.color = '#a2a2a2';
  getEl('js-type-03').innerHTML = phrase4.split(' ')[2];
  
  moveSwitch('js-next-02');
  await expandSwitch(3);
  await elapseTime(500);
  
  await turnOnSwitch(20);

  getEl('js-type-03').classList.add('font-color-transition');
  getEl('js-main-img-2').classList.add('col-opacity-trans');
  blinkCaret();

  await elapseTime(1500); // 1500  current delay after ph4 switch
  getEl('js-switch-wr').remove();
  await initBanner(1000); // 180 --> 1000

  // *** NEW LINE ADDED HERE TO CLEAR JS-TYPE-03 ***
  getEl('js-type-03').innerHTML = ''; // Ensure "Painting" is gone
  // ***********************************************

  const phrase5Arr = phrase5.split(' ');
  
  moveCaret('js-type-01');
  await elapseTime(2500);  // 1500 to 2500
  // Set phrase5 to white
  getEl('js-type-01').style.color = '#fff';
  await typeText('js-type-01', phrase5Arr[0], 100);
  getEl('js-space-01').classList.remove('hidden');
  // await typeText('js-type-02', phrase5Arr[1], 100);

  getEl('js-space-02').classList.remove('hidden');
  if (isMobile())getEl('js-next-02').classList.remove('hidden'); 
  // await typeText('js-type-03', phrase5Arr[2], 20);
  await elapseTime(500);

  // await elapseTime(2000);
  getEl('js-type-03').innerHTML = '';
  moveCaret('js-type-03');

  hideCaret();
  getEl('js-type-03').classList.remove('font-color-transition');

  getEl('js-type-03').innerHTML = phrase5.split(' ')[1];
  getEl('js-type-03').style.color = '#fff';
  moveVolume('js-next-02');
  await startVolume('js-type-03', 500);
  blinkCaret();
  await elapseTime(1200);

  getEl('js-main-img-3').classList.add('full-opacity-trans'); // color img
  getEl('js-volume-wr').remove(); // remove speaker
  getEl('js-type-03').classList.remove('vol-color-high', 'vol-color-low', 'vol-color-off');
  await initBanner(100);  // 30 to 100

  // getEl('js-main-img-3').classList.add('full-opacity-trans');
  await elapseTime(2500); // 1500 to 2500

  getEl('js-banner-wr').style.textAlign = 'center'; // list one is centered
  if (isMobile()) {
    getEl('js-banner-wr').style.marginLeft = 0;
    getEl('js-banner-wr').style.lineHeight = 0.4;
    getEl('js-type-02').style.lineHeight = 2.1;
  }

  const phrase6Arr = phrase6.split(' ');

  if (isMobile()) getEl('js-banner-wr').style.paddingLeft = 0;
  getEl('js-type-01').style.color = '#fff';
  getEl('js-type-02').style.color = '#fff';
  getEl('js-type-03').style.color = '#fff';
  moveCaret('js-type-01');
  await typeText('js-type-01', phrase6Arr[0], 50);
  getEl('js-space-01').classList.remove('hidden');
  if (isMobile())getEl('js-next-01').classList.remove('hidden'); 
  // await typeText('js-type-02', phrase6Arr[1], 100);
  getEl('js-space-02').classList.remove('hidden');
  if (isMobile())getEl('js-next-02').classList.remove('hidden'); 
  await typeText('js-type-03', phrase6Arr[1], 40);
  await elapseTime(1500);

  hideCaret();
  getEl('js-type-02').innerHTML = `<div class='image-wr globe-wr fi-short'><img  id='js-globe' class='globe-size' src='./icon/globe-white-solid.svg'></div>`;
  await elapseTime(1000);

  getEl('js-link').style.opacity = 1;
  getEl('js-link-details').classList.add('flashing');

}

const gotoHome = () => {
  window.location.href = './index.html';
}

const startEventListener = () => {
  startContactListener(); // start listener
}

const main = async () => {
  await loadEnv();
  startEventListener();

  if (!isMobile()) {
    getEl('js-main-img-1').src = './img/banner-bw.jpg';
    getEl('js-main-img-2').src = './img/banner-col.jpg';
    getEl('js-main-img-3').src = './img/banner-full.jpg';
  }
  await loadFont();

  renderBanner();
  fillStaticText();


}

main();