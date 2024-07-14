import { css } from "goober";
import { useEffect, useMemo, useRef, useState } from "react";

import { Player } from "textalive-app-api";
import type { IPlayerApp, PlayerListener, RenderingUnitFunction, ValenceArousalValue } from "textalive-app-api";

type rPlayer = Player | undefined;

export const PlayerWrapper = () => {
  const mediaRef = useRef<HTMLDivElement>(null);
  const MediaDiv = useMemo(() => (
    <div
      className={css({
        position: "fixed",
        right: "0",
        bottom: "0",
      })}
      ref={mediaRef}
    />
  ), []);

  const [player, setPlayer] = useState<rPlayer>();

  useEffect(() => {
    if (mediaRef.current == null) return;

    const player = new Player({
      app: {
        token: import.meta.env.VITE_TextAlive_Token,
      },
      mediaElement: mediaRef.current,
      valenceArousalEnabled: true,
      vocalAmplitudeEnabled: true,
    });

    player.addListener({
      onAppReady: (app: IPlayerApp) => {
        // 設定されてなかったら新しく設定する
        if (!app.songUrl) {
          player.createFromSongUrl("https://www.youtube.com/watch?v=XSLhsjepelI");
        }
      },
    });

    setPlayer(player);

    return () => {
      if (!player) return;
      if (player.isPlaying) {
        player.requestStop();
        player.createFromSongUrl("");
      }
      setPlayer(undefined);
    };
  }, []);

  return (
    <>
      {MediaDiv}
      {/* 以下にコード */}
      <Lyric player={player} />
      <SongMap player={player} />
    </>
  );
};

const Lyric = ({
  player
}: {
  player: rPlayer,
}) => {
  const [lyric, setLyric] = useState<String>();

  useEffect(() => {
    if (!player) return;

    const animateWord: RenderingUnitFunction = (now, unit) => {
      if (unit.contains(now)) {
        // @ts-ignore
        setLyric(unit.text);
      }
    }

    const listener: PlayerListener = {
      onVideoReady: () => {
        // 定期的に呼ばれる各単語の "animate" 関数をセットする
        let w = player.video.firstWord;
        while (w) {
          w.animate = animateWord;
          w = w.next;
        }
      },
    }

    player.addListener(listener);
    return () => {
      player.removeListener(listener);
    }
  }, [player])

  return <>
    <h1>歌詞表示</h1>
    <p>{lyric}</p>
  </>;
}

const SongMap = ({
  player
}: {
  player: rPlayer,
}) => {
  const [vocalAmplitude, setVocalAmplitude] = useState<Number>();
  const [valenceArousal, setValenceArousal] = useState<ValenceArousalValue>();

  useEffect(() => {
    if (!player) return;

    const listener: PlayerListener = {
      onTimeUpdate: (position: number) => {
        setVocalAmplitude(Math.round(player.getVocalAmplitude(position)));
        setValenceArousal(player.getValenceArousal(position));
      }
    }

    player.addListener(listener);
    return () => {
      player.removeListener(listener);
    }
  }, [player])

  return <>
    <h1>声量</h1>
    <p>{vocalAmplitude?.toString()}</p>
    <h1>覚醒度</h1>
    <p>{valenceArousal?.a}</p>
    <h1>感情値</h1>
    <p>{valenceArousal?.v}</p>
  </>;
}
