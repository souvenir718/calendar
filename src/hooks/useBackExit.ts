import { useEffect, useRef } from "react";

/**
 * 모달이 열릴 때 history state를 추가하고, 
 * 뒤로가기 이벤트(popstate)가 발생하면 모달을 닫도록 처리하거나,
 * 모달이 수동으로 닫힐 때 추가했던 history를 정리하는 훅입니다.
 * 
 * @param onClose 모달을 닫는 함수
 */
export function useBackExit(onClose: () => void) {
    const isClosedByBack = useRef(false);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        // 1. 모달 진입 시 브라우저 히스토리에 state 추가
        // 고유 ID를 생성하여 현재 모달 인스턴스가 추가한 히스토리인지 식별합니다.
        const modalId = Math.random().toString(36).substr(2, 9);
        history.pushState({ modalId }, "", window.location.href);
        const mountTime = Date.now();

        const handlePopState = () => {
            // React StrictMode 등에서 마운트 직후 발생할 수 있는 popstate 무시 (100ms)
            if (Date.now() - mountTime < 100) return;

            // 2. 뒤로가기가 발생하면(히스토리가 pop되면) 모달을 닫음
            isClosedByBack.current = true;
            onCloseRef.current();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);

            // 3. 컴포넌트 언마운트 시(모달 닫힘)
            // 만약 뒤로가기 버튼으로 닫힌 게 아니라면(X 버튼 등 수동 종료),
            // 현재 히스토리 상태가 이 모달이 push한 상태일 때만 뒤로가기를 실행합니다.
            if (!isClosedByBack.current) {
                if (history.state && history.state.modalId === modalId) {
                    history.back();
                }
            }
        };
    }, []);
}
