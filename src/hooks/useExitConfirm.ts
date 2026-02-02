import { useEffect, useRef } from "react";

/**
 * 뒤로가기를 감지하여 앱 종료 여부를 확인하는 모달을 띄우기 위한 훅입니다.
 * 
 * @param onCheck 뒤로가기가 감지되었을 때 실행할 콜백 (주로 모달 open)
 * @param enable 활성화 여부 (모달이 열려있지 않을 때만 true여야 함, 혹은 항상 true)
 */
export function useExitConfirm(onCheck: () => void, enable: boolean = true) {
    // 뒤로가기 처리를 위해 history state를 조작했는지 여부
    const isPushedRef = useRef(false);

    useEffect(() => {
        if (!enable) return;

        // 1. 현재 상태를 push하여 "뒤로 갈 공간"을 만듦
        // 모달이 닫힌 후(enable이 다시 true가 될 때) 트랩을 재설치해야 함
        // useBackExit 훅이 모달 닫을 때 history.back()을 호출하므로, 
        // 약간의 지연 후 트랩을 설치해야 안정적으로 동작함
        const installTrap = () => {
            if (!isPushedRef.current) {
                history.pushState({ exitConfirm: true }, "", window.location.href);
                isPushedRef.current = true;
            }
        };

        // 초기 마운트 시에도 약간의 지연을 주어 모바일 브라우저에서도 안정적으로 동작하도록 함
        const timerId = setTimeout(installTrap, 50);

        const handlePopState = (event: PopStateEvent) => {
            // 2. 뒤로가기 발생 (state가 pop됨)
            // 사용자가 뒤로가기를 눌렀으므로 확인 모달을 띄움

            // 만약 현재 state가 exitConfirm: true라면, 
            // 이는 "모달을 닫아서" exitConfirm 상태로 돌아온 것일 수 있음.
            // (즉, 미래의 state에서 history.back()을 해서 현재로 돌아옴)
            // 이 경우엔 종료 확인 모달을 띄우지 않아야 함.
            const currentState = event.state as { exitConfirm?: boolean } | null;
            if (currentState?.exitConfirm) {
                // 트랩 상태로 돌아온 것이므로, isPushedRef는 여전히 true여야 함
                // 하지만 혹시 꺼져있다면 켜줌
                isPushedRef.current = true;
                return;
            }

            // push 상태 해제됨 (실제로 뒤로가기 눌러서 트랩을 벗어남)
            isPushedRef.current = false;

            onCheck();
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            clearTimeout(timerId);
            window.removeEventListener("popstate", handlePopState);
            // enable이 false로 바뀔 때(모달이 열릴 때) isPushedRef를 리셋
            // 이렇게 해야 모달이 닫힌 후(enable이 다시 true가 될 때) 트랩이 재설치됨
            // 모달의 useBackExit가 history.back()을 호출해서 트랩을 해제할 수 있기 때문
            isPushedRef.current = false;
        };
    }, [enable, onCheck]); // enable이 바뀔 때마다 재설정

    // 사용자가 "취소"를 눌렀을 때 다시 트랩을 설치하기 위한 함수
    const restoreExitConfirm = () => {
        if (!isPushedRef.current) {
            history.pushState({ exitConfirm: true }, "", window.location.href);
            isPushedRef.current = true;
        }
    };

    // 사용자가 "종료"를 눌렀을 때 실제로 뒤로가기(종료)를 실행하기 위한 함수
    const confirmExit = () => {
        // 이미 popstate가 발생해서 state가 하나 빠진 상태임.
        // 여기서 한 번 더 back을 하면 앱이 종료되거나 이전 페이지로 감.
        if (!isPushedRef.current) {
            history.back();
        } else {
            // 만약 push된 상태에서 강제 종료라면(버튼 클릭 등) -2를 해야함
            history.go(-2);
        }
    };

    return { restoreExitConfirm, confirmExit };
}
