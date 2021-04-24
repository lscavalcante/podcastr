// SPA
// SSR
// SSG
import { useContext, useEffect } from "react"
import { GetStaticProps } from 'next';
import Image from 'next/image';
import Heade from 'next/head';
import Link from 'next/link';

import { api } from "../services/api";
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationToTimeString } from "../utils/convertDurationToTimeString";

import styles from './home.module.scss';
import { PlayerContext } from "../contexts/PlayerContext";

interface EpisodeProps {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}
interface HomeProps {
  allEpisodes: EpisodeProps[];
  latestEpisodes: EpisodeProps[];
}


export default function Home({ allEpisodes, latestEpisodes }: HomeProps) {
  const { playList } = useContext(PlayerContext);

  const episodeList = [...latestEpisodes, ...allEpisodes];

  // SPA
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes/').then(response => response.json()).then(data => console.log(data))
  // }, []);

  return (
    <div className={styles.homePage}>

      <Heade>
        <title>Home | Podcastr</title>

      </Heade>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {
            latestEpisodes.map((episode, index) => {
              return (
                <li key={episode.id}>
                  <Image
                    width={192}
                    height={192}
                    src={episode.thumbnail}
                    alt={episode.title}
                    objectFit="cover"
                  />

                  <div className={styles.episeDetails}>
                    <Link href={`/episodes/${episode.id}`}>
                      <a >{episode.title}</a>
                    </Link>
                    <p>{episode.members}</p>
                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>

                  <button type="button" onClick={() => playList(episodeList, index)}>
                    <img src="/play-green.svg" alt="tocar episodio" />
                  </button>
                </li>
              );
            })
          }
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duraçāo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
              allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{ width: 72 }}>
                      <Image
                        width={120}
                        height={120}
                        src={episode.thumbnail}
                        alt={episode.title}
                        objectFit="cover"
                      />
                    </td>
                    <td>
                      <Link href={`/episodes/${episode.id}`}>
                        <a>{episode.title}</a>
                      </Link>
                    </td>
                    <td>{episode.members}</td>
                    <td style={{ width: 100 }}>{episode.publishedAt}</td>
                    <td>{episode.durationAsString}</td>
                    <td>
                      <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                        <img src="/play-green.svg" alt="Tocar episódio" />
                      </button>
                    </td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </section>


    </div>
  )
}

// SSR
// export async function getServerSideProps() {
//   const response = await fetch('http://localhost:3333/episodes/');
//   const data = await response.json();

//   return {
//     props: {
//       episodes: data,
//     }
//   }
// }

// SSG
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map((episode: any) => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      //publishedAt: parseISO(episode.published_at, 'd MMM yy', {locale: ptBr})
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
      description: episode.description,
      url: episode.file.url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      allEpisodes: allEpisodes,
      latestEpisodes: latestEpisodes

    },
    revalidate: 60 * 60 * 8, // 8 hours
  }
}
