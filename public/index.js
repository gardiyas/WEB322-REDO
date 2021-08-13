/************************************************************************************
* WEB322 – Assignment 3 (Winter 2021)
* I declare that this assignment is my own work in accordance with Seneca Academic
* Policy. No part of this assignment has been copied manually or electronically from
* any other source (including web sites) or distributed to other students.
*
* Name: Emre Isik
* Student ID: 137524195
* Course: WEB322NCC
*
************************************************************************************/

var itemImages = [
    {
      src: 'images/promotions/img1.jpg',
      alt: 'Promotion Image Not Available'
      
    
    },
    {
      src: 'images/promotions/img2.jpg',
      alt: 'Promotion Image Not Available'
    },
    {
      src: 'images/promotions/img3.jpg',
      alt: 'Promotion Image Not Available'
    }
  ];
  
  function func1() {
    var imageContainer = document.querySelector('.product-item');
  
    var str = '<div class="item">' + '<div class="item-image">' + '<div class="img-hover-zoom">';
  
    var myImageStr = '\0';
    var a = '\0';
    var b = '\0';
    for (var i = 0; i < 3; i++) {
      a =
        '<img src="' +
        itemImages[i].src +
        '" alt="' +
        itemImages[i].alt +
        '"></div>' +
        '<div class="item-button">' +
        '<a href="#">Details</a></div></div><div class="item-title">';
  
      b = '</div></div></div>';
  
      myImageStr += str + a + b;
    }
  
    imageContainer.innerHTML = myImageStr;
  }
  
  
  function start() {
    func1();
  }
  window.onload = start;