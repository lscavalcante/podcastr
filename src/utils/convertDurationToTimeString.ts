export function convertDurationToTimeString(duration: number) : string {
    
    // arredonda para o menor numero da funçāo!
    const hours = Math.floor(duration / 3600);
    // vou capturar quantos minutos restam da duration
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;

    const timeString = [hours, minutes, seconds].map(
        // se em unit retornar apenas 1 hora ele adiciona o zero(0) na frente ficando 01
        (unit) => String(unit).padStart(2, '0')).join(':');
    return timeString;
}