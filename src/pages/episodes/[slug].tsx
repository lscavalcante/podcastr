import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { usePlayer } from '../../contexts/PlayerContext';
import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import style from './episode.module.scss';

type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
    publishedAt: string;
    durationAsString: string;
    description: string;
}

interface EpisodeProps {
    episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {

    // const router = useRouter();
    // está em carregamento - usado quando getStaticPaths for true
    // if(router.isFallback) {
    //     return <p>Loading !!!</p>
    // }

    const { play } = usePlayer();

    return (
        <div className={style.episode}>
            <Head>
                <title>Home | {episode.title}</title>

            </Head>


            <div className={style.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />

                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="tocar episodio" />
                </button>

            </div>


            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div className={style.description} dangerouslySetInnerHTML={{ __html: episode.description }} />

        </div>
    );
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            // {
            //     params: { slug: 'uma-conversa-sobre-programacao-funcional-e-orientacao-a-objetos' }
            // }
        ],
        // blocking -> false retorna falso pq n tem nenhuma pagina salva de forma statica
        // blocking -> true se ele n tiver salvo ele vai buscar os dados pelo browser e salvar os dados staticos
        // blocking -> blocking faz o carregamento na camada do node
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {

    // slug is name archive
    const { slug } = ctx.params;

    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
    };

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24 // 24 hours
    }
}