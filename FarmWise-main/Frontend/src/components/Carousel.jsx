import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';


class DemoCarousel extends Component {
    render() {
        return (
            <Carousel
                showArrows={true}
                showStatus={false}
                showThumbs={false}
                showIndicators={false}
                infiniteLoop={true}
                autoPlay={true}
                interval={3000}
                transitionTime={1000}
                stopOnHover={false}
                swipeable={true}
                emulateTouch={true}
                dynamicHeight={false}
                useKeyboardArrows={true}
                axis="horizontal"
                verticalSwipe="natural"
            >
                <div>
                    <img src="./C21.png" />
                    {/* <p className="legend">Legend 1</p> */}
                </div>
                <div>
                    <img src="./C31.png" />
                    {/* <p className="legend">Legend 2</p> */}
                </div>
                <div>
                    <img src="./C1.png" />
                    {/* <p className="legend">Legend 3</p> */}
                </div>
            </Carousel>
        );
    }
}
export default DemoCarousel;