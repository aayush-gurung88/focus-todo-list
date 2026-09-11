import React, {useState, useEffect} from 'react';

function DigitalClock(){
    
    const [time , setTime] = useState(new Date());
    const [quote, setQuote] = useState("");

    useEffect( ()=> {
        const intervalId = setInterval(() => {
            setTime(new Date());
        } , 1000);

        return () => {
            clearInterval(intervalId);
        }
    }, [])

   // quote new show garna api fetch gareko 
   useEffect(() => {
          fetch("/api/api/random")
        .then(res => res.json())
        .then(data => setQuote(data[0].q))
        .catch(() => setQuote("Pani Piyo ta aaja ?"));
    }, []);

    function formatTime(){
        let hours = time.getHours();
        const minutes = time.getMinutes();
        let seconds = time.getSeconds();
        const meridiem = hours >= 12 ? "PM" : "AM";

        hours = hours % 12 || 12 ; 
        
        // 13 % 12 is 1 and that is 1 oclock , 12 % 12 is 0 

        // const dateStr = time.toLocaleDateString(); // add date --> 3/4/2026

        return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)} ${meridiem}`
    }

    function padZero(number){
        return (number < 10 ? "0" : "") + number;
    }

      return (
        <div className = "clock-card">
            <div className="clock-top">
                <div className="quote-block">
                    <span className='quote-label'>Daily Quote</span>
                    <span className='quote'>"{quote}"</span>
                </div>
                <span className='date'>{time.toDateString()}</span>
            </div>
            <div className="time">
                {formatTime()}
            </div>
        </div>
        );
}

export default DigitalClock
