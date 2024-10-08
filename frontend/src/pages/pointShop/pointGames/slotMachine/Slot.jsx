import React, { useImperativeHandle, forwardRef, useState, useEffect } from "react";
import "../../../../assets/style/pointGame/slot/SlotMachine.css";

const Slot = forwardRef(({ fruits }, ref) => {
    const [rolling, setRolling] = useState(false);
    const [position, setPosition] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    useImperativeHandle(ref, () => ({
        startRolling() {
            setRolling(true);
        },
        stopRolling() {
            setRolling(false);
            clearInterval(intervalId);
        },
        reset() {
            setRolling(false);
            clearInterval(intervalId);
            setPosition(0);
        },
        getResult() {
            const totalHeight = fruits.length * 90;
            const normalizedPosition = (position % totalHeight + totalHeight) % totalHeight;
            // 화살표가 가리키는 슬롯의 중앙을 기준으로 이미지 인덱스를 계산
            const centerOffset = 45; // 슬롯의 높이(90px)의 절반
            const index = Math.floor((normalizedPosition + 45) / 90) % fruits.length; // Adjust to ensure accurate result
            return fruits[index];
        }
    }));

    useEffect(() => {
        if (rolling) {
            const id = setInterval(() => {
                setPosition((prev) => {
                    const newPos = prev - 30; // Increase speed by increasing the value (s:20, f:30)
                    if (newPos <= -fruits.length * 80) {
                        return 0; // Reset the scroll when it reaches the end (s:90, f:80)
                    }
                    return newPos;
                });
            }, 50); // Increase speed by decreasing the interval time (s:100, f:50)
            setIntervalId(id);
        } else {
            clearInterval(intervalId);
        }
        return () => clearInterval(intervalId);
    }, [rolling]);

    return (
        <div className="slot">
            <section className="slot-section">
                <div className="slot-container" style={{ top: `${position}px` }}>
                    {fruits.concat(fruits).map((fruit, i) => (
                        <div key={i}>
                            <span>{fruit}</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
});

export default Slot;
