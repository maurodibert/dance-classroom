import type { Genre } from './types'

export const genres: Genre[] = [
  {
    id: 'salsa',
    name: 'Salsa',
    emoji: '🔥',
    tagline: 'Energía, ritmo y sabor cubano',
    origin: 'Cuba / Nueva York',
    tempo: '160–220 BPM',
    levels: [
      {
        level: 'inicial',
        description: 'Construimos la base: el tiempo musical, el peso y los primeros pasos.',
        steps: [
          {
            id: 'salsa-i-1',
            name: 'Paso básico en el lugar',
            description: 'El corazón de la salsa. Aprende a marcar los tiempos 1-2-3 / 5-6-7 sin moverte de lugar.',
            tips: ['Rodillas levemente flexionadas', 'El peso cambia en cada tiempo', 'Tiempo 4 y 8: pausa'],
            videoUrl: 'https://www.youtube.com/embed/ViRdeZ5hnlw',
          },
          {
            id: 'salsa-i-2',
            name: 'Básico hacia adelante y atrás',
            description: 'Llevá el básico al espacio: un pie adelante en el 1, otro atrás en el 5.',
            tips: ['Mantené el torso erguido', 'No des pasos grandes', 'Los pies no más anchos que los hombros'],
            videoUrl: 'https://www.youtube.com/embed/tE18rzWcnBE',
          },
          {
            id: 'salsa-i-3',
            name: 'Posición de pareja (closed)',
            description: 'Aprende el agarre estándar: mano derecha en la escápula, mano izquierda extendida.',
            tips: ['El líder guía con el pecho, no con los brazos', 'Mantené un marco firme pero relajado'],
          },
          {
            id: 'salsa-i-4',
            name: 'Cambio de posición (side step)',
            description: 'Llevá el básico lateral: 1 al costado, 2 junto, 3 al costado otra vez.',
            tips: ['El movimiento de cadera nace del cambio de peso', 'Música lenta primero'],
          },
          {
            id: 'salsa-i-5',
            name: 'Vuelta simple del seguidor',
            description: 'El líder levanta el brazo izquierdo y guía al seguidor en una vuelta entera.',
            tips: ['La vuelta empieza en el 1', 'El líder no gira, solo eleva el brazo', 'El seguidor completa en el 3'],
          },
        ],
      },
      {
        level: 'intermedio',
        description: 'Sumamos giros, cambios de mano y conexión musical más profunda.',
        steps: [
          {
            id: 'salsa-m-1',
            name: 'Cross body lead',
            description: 'El movimiento más icónico de la salsa en línea. El líder se cruza para cambiar de lado con el seguidor.',
            tips: ['El líder pasa por el lado derecho del seguidor', 'El seguidor cruza en línea recta'],
          },
          {
            id: 'salsa-m-2',
            name: 'Vuelta doble del seguidor',
            description: 'Dos vueltas en el tiempo de un básico. Requiere impulso y spot preciso.',
            tips: ['El seguidor mantiene la vista fija (spot)', 'El líder da impulso claro en el 1'],
          },
          {
            id: 'salsa-m-3',
            name: 'Inside turn (vuelta del líder)',
            description: 'El líder pasa por debajo de su propio brazo para girar hacia adentro.',
            tips: ['Mantén el agarre flojo para no torcer la muñeca', 'Completá la vuelta antes del 4'],
          },
          {
            id: 'salsa-m-4',
            name: 'Dile que no',
            description: 'Variante cubana del cross body: el líder detiene al seguidor con la mano y lo reenvía.',
            tips: ['La detención es suave, no brusca', 'El seguidor lee el "no" y cambia dirección'],
          },
          {
            id: 'salsa-m-5',
            name: 'Cambio de manos detrás de la espalda',
            description: 'El líder pasa la mano del seguidor detrás de su propia espalda durante el cross body.',
            tips: ['Practicá primero sin compañero', 'El movimiento es continuo, no se pausa'],
          },
        ],
      },
      {
        level: 'avanzado',
        description: 'Técnicas complejas: dobles giros, trabajo de pies avanzado y musicalidad.',
        steps: [
          {
            id: 'salsa-a-1',
            name: 'Doble giro lateral (follower)',
            description: 'El seguidor ejecuta dos giros seguidos con desplazamiento lateral.',
            tips: ['El spot es crítico', 'Los pies juntos en el eje durante los giros'],
          },
          {
            id: 'salsa-a-2',
            name: 'Base cubana',
            description: 'Patrón de 8 tiempos con movimiento circular y trabajo de caderas estilo cubano.',
            tips: ['El movimiento de cadera es continuo, no marcado', 'La conexión visual con la pareja es constante'],
          },
          {
            id: 'salsa-a-3',
            name: 'Triple giro del líder',
            description: 'Tres vueltas consecutivas del líder manteniendo el agarre.',
            tips: ['Velocidad de brazo constante', 'No sueltes el agarre hasta completar la tercera vuelta'],
          },
          {
            id: 'salsa-a-4',
            name: 'Shines (trabajo de pies solo)',
            description: 'Sección de la canción donde ambos bailan solos mostrando trabajo de pies individual.',
            tips: ['Escuchá los cortes musicales', 'Empezá con patrones de 4 tiempos antes de improvisar'],
          },
          {
            id: 'salsa-a-5',
            name: 'Cadena de vueltas en parejas',
            description: 'Secuencia de 4 vueltas alternadas líder/seguidor sin perder el tiempo musical.',
            tips: ['El timing entre vueltas es el punto más difícil', 'Practicá cada vuelta por separado primero'],
          },
        ],
      },
    ],
  },
  {
    id: 'bachata',
    name: 'Bachata',
    emoji: '🌹',
    tagline: 'Sensualidad, corazón y caderas',
    origin: 'República Dominicana',
    tempo: '120–140 BPM',
    levels: [
      {
        level: 'inicial',
        description: 'La bachata empieza con el paso de 4 tiempos y el golpe de cadera característico.',
        steps: [
          {
            id: 'bach-i-1',
            name: 'Paso básico lateral',
            description: 'Tres pasos al costado y golpe de cadera en el 4. Luego idem al otro lado.',
            tips: ['El golpe es en el 4, no en el 3', 'Las rodillas se flexionan en el golpe', 'El movimiento es continuo'],
          },
          {
            id: 'bach-i-2',
            name: 'Básico adelante y atrás',
            description: 'La misma estructura de 3+golpe pero en dirección adelante/atrás.',
            tips: ['Mantené el peso adelante cuando avanzás', 'El torso se inclina levemente'],
          },
          {
            id: 'bach-i-3',
            name: 'Posición de pareja bachata',
            description: 'Agarre más cercano que en salsa: mano en la cintura o cadera del seguidor.',
            tips: ['La distancia varía según el estilo (tradicional vs. sensual)', 'La conexión del pecho es importante'],
          },
          {
            id: 'bach-i-4',
            name: 'Vuelta básica del seguidor',
            description: 'En el tiempo 1, el líder eleva el brazo y el seguidor hace media vuelta.',
            tips: ['La vuelta ocupa los 4 tiempos', 'No apures la vuelta'],
          },
          {
            id: 'bach-i-5',
            name: 'Lado a lado (side by side)',
            description: 'Los dos bailarines se colocan uno al lado del otro y hacen el básico en paralelo.',
            tips: ['Es un buen momento para añadir estilo personal', 'Mantené el ritmo coordinado'],
          },
        ],
      },
      {
        level: 'intermedio',
        description: 'Incorporamos vueltas, ondulaciones de cuerpo y conexión más íntima.',
        steps: [
          {
            id: 'bach-m-1',
            name: 'Body wave básico',
            description: 'Ondulación del torso que parte de las caderas y sube hasta los hombros.',
            tips: ['La ola empieza en las caderas, no en el pecho', 'Practicá frente al espejo'],
          },
          {
            id: 'bach-m-2',
            name: 'Vuelta con caminata',
            description: 'El seguidor hace una vuelta mientras camina alrededor del líder.',
            tips: ['El líder pivota en el lugar', 'Los 4 tiempos se usan completos'],
          },
          {
            id: 'bach-m-3',
            name: 'Shadow position',
            description: 'El líder se posiciona detrás del seguidor, ambos mirando hacia adelante.',
            tips: ['La comunicación es por presión de manos', 'Los movimientos de cadera se sincronizan'],
          },
          {
            id: 'bach-m-4',
            name: 'Dip básico',
            description: 'Al final de una frase musical, el líder sostiene al seguidor en una inclinación hacia atrás.',
            tips: ['El líder debe soportar el peso, no solo inclinar', 'El seguidor confía y se deja ir'],
          },
          {
            id: 'bach-m-5',
            name: 'Cambio de lado',
            description: 'Los dos pasan de un lado al otro cruzándose durante el básico.',
            tips: ['El líder guía la dirección con el pecho', 'No se pierde el compás durante el cruce'],
          },
        ],
      },
      {
        level: 'avanzado',
        description: 'Estilo sensual, musicalidad avanzada y movimientos de piso.',
        steps: [
          {
            id: 'bach-a-1',
            name: 'Full body wave en pareja',
            description: 'Los dos sincronizan una ondulación corporal completa frente a frente.',
            tips: ['La ola del líder y el seguidor se encuentran en el medio', 'Requiere mucha escucha corporal'],
          },
          {
            id: 'bach-a-2',
            name: 'Cambre (inclinación hacia atrás del seguidor)',
            description: 'El seguidor se arquea hacia atrás mientras el líder sostiene y guía.',
            tips: ['El líder sostiene con el brazo en la espalda baja', 'La recuperación es tan importante como la inclinación'],
          },
          {
            id: 'bach-a-3',
            name: 'Giro con body roll',
            description: 'El seguidor hace una vuelta incorporando una ondulación al inicio y al final.',
            tips: ['La ondulación se hace antes de iniciar el giro', 'No pierdas el spot'],
          },
          {
            id: 'bach-a-4',
            name: 'Footwork avanzado (tacones)',
            description: 'Trabajo de pies individuales: cruzados, puntas, patrones sincopados.',
            tips: ['Practicá lento con metrónomo', 'Cada golpe tiene intención musical'],
          },
          {
            id: 'bach-a-5',
            name: 'Interpretación musical',
            description: 'Coreografiar una sección de bachata respondiendo a los instrumentos (guitarra, bongó, requinto).',
            tips: ['El requinto suele marcar los momentos de acción', 'Las pausas musicales son oportunidades para el dip'],
          },
        ],
      },
    ],
  },
  {
    id: 'kizomba',
    name: 'Kizomba',
    emoji: '🌙',
    tagline: 'Conexión pura, movimiento como agua',
    origin: 'Angola',
    tempo: '60–100 BPM',
    levels: [
      {
        level: 'inicial',
        description: 'La kizomba se basa en la caminata, la conexión y la escucha. Empezamos desde cero.',
        steps: [
          {
            id: 'kiz-i-1',
            name: 'Posición de abrazo kizomba',
            description: 'Contacto de pecho, mejilla contra mejilla (o frente), sin tensión en los brazos.',
            tips: ['La conexión es con el pecho, no los brazos', 'Relajá los hombros', 'Respirá junto con tu pareja'],
          },
          {
            id: 'kiz-i-2',
            name: 'Caminata básica',
            description: 'Simplemente caminar en compás, alternando pie izquierdo y derecho con el pulso.',
            tips: ['No pienses en pasos, pensá en caminar', 'El peso se transfiere completamente a cada pie'],
          },
          {
            id: 'kiz-i-3',
            name: 'Paso básico (saída)',
            description: 'Un paso al costado y uno atrás que forma la base de todos los movimientos.',
            tips: ['Contá 1-2-3, pausa', 'La pausa es intencional, no un error'],
          },
          {
            id: 'kiz-i-4',
            name: 'Retroceso',
            description: 'El líder retrocede dos pasos llevando al seguidor con él.',
            tips: ['El seguidor no debe resistir', 'El movimiento es fluido, sin tirones'],
          },
        ],
      },
      {
        level: 'intermedio',
        description: 'Añadimos desconexiones de cadera, giros lentos y variaciones de caminata.',
        steps: [
          {
            id: 'kiz-m-1',
            name: 'Desconexión de cadera',
            description: 'El seguidor separa las caderas del líder para añadir movimiento propio.',
            tips: ['La parte superior sigue conectada', 'El movimiento de cadera es libre y orgánico'],
          },
          {
            id: 'kiz-m-2',
            name: 'Giro en el lugar',
            description: 'El líder lleva al seguidor en una vuelta lenta, manteniendo el abrazo.',
            tips: ['El giro ocupa toda la frase musical (4 tiempos)', 'No apures la vuelta'],
          },
          {
            id: 'kiz-m-3',
            name: 'Caminata en triángulo',
            description: 'Los dos dibujan un triángulo en el piso mientras mantienen la conexión.',
            tips: ['Los pasos son pequeños y precisos', 'El líder anticipa cada cambio de dirección'],
          },
        ],
      },
      {
        level: 'avanzado',
        description: 'Musicalidad profunda, improvisación y trabajo de caderas avanzado.',
        steps: [
          {
            id: 'kiz-a-1',
            name: 'Semba básico',
            description: 'Raíz de la kizomba: movimiento con rebote y mayor separación entre parejas.',
            tips: ['El rebote viene de las rodillas', 'El centro de gravedad es más bajo'],
          },
          {
            id: 'kiz-a-2',
            name: 'Tarraxinha',
            description: 'Estilo ultra lento y sensual derivado de la kizomba, con micro-movimientos.',
            tips: ['La música marca el tempo', 'Cada movimiento es intencional y preciso'],
          },
          {
            id: 'kiz-a-3',
            name: 'Saída com roda',
            description: 'Salida con vuelta alrededor del eje del líder manteniendo la conexión.',
            tips: ['El seguidor no suelta el abrazo', 'El líder pivota sobre el pie de soporte'],
          },
        ],
      },
    ],
  },
  {
    id: 'merengue',
    name: 'Merengue',
    emoji: '🎺',
    tagline: 'El baile más accesible del Caribe',
    origin: 'República Dominicana',
    tempo: '120–160 BPM',
    levels: [
      {
        level: 'inicial',
        description: 'El merengue se aprende rápido: paso básico lateral y compás de 2.',
        steps: [
          {
            id: 'mer-i-1',
            name: 'Paso básico lateral',
            description: 'Dos pasos al costado en compás de 2/4. Un pie al lado, el otro lo sigue.',
            tips: ['Un tiempo = un paso', 'Las rodillas levemente flexionadas', 'El movimiento es continuo, no hay pausa'],
          },
          {
            id: 'mer-i-2',
            name: 'Marcación de cadera',
            description: 'Con cada paso, la cadera se eleva ligeramente del lado del pie de soporte.',
            tips: ['La cadera sube naturalmente al cambiar el peso', 'No fuerces el movimiento'],
          },
          {
            id: 'mer-i-3',
            name: 'Posición de pareja',
            description: 'Agarre estándar: mano derecha del líder en la escápula, mano izquierda extendida.',
            tips: ['El líder guía con el pecho y el cuerpo, no solo los brazos', 'Mantené un marco firme'],
          },
          {
            id: 'mer-i-4',
            name: 'Marcha en el lugar',
            description: 'Marcar el compás levantando los pies alternadamente sin desplazarse.',
            tips: ['Ideal para practicar el tiempo musical', 'Exagerá la cadera al inicio para sentirla'],
          },
          {
            id: 'mer-i-5',
            name: 'Vuelta básica del seguidor',
            description: 'El líder eleva el brazo y el seguidor da una vuelta entera en dos tiempos.',
            tips: ['La vuelta ocupa exactamente 2 tiempos', 'El líder no se mueve del lugar'],
          },
        ],
      },
      {
        level: 'intermedio',
        description: 'Incorporamos desplazamientos, vueltas consecutivas y trabajo de brazos.',
        steps: [
          {
            id: 'mer-m-1',
            name: 'Paso en L',
            description: 'Combinar paso lateral con paso adelante/atrás formando una L en el piso.',
            tips: ['Dos pasos laterales, luego dos adelante/atrás', 'Mantené el ritmo constante'],
          },
          {
            id: 'mer-m-2',
            name: 'Doble vuelta del seguidor',
            description: 'Dos vueltas consecutivas aprovechando la velocidad del merengue.',
            tips: ['El impulso viene del paso 1', 'El seguidor hace spot para no marear'],
          },
          {
            id: 'mer-m-3',
            name: 'Caminata en círculo',
            description: 'Los dos caminan en círculo alrededor de un eje central mientras bailan.',
            tips: ['El líder dirige el círculo con el marco', 'Los pasos son pequeños y uniformes'],
          },
          {
            id: 'mer-m-4',
            name: 'Figura del abanico',
            description: 'El líder abre al seguidor hacia el costado y lo trae de vuelta como un abanico.',
            tips: ['La señal de apertura es con la mano izquierda', 'Cuatro tiempos para abrir, cuatro para cerrar'],
          },
          {
            id: 'mer-m-5',
            name: 'Trabajo de brazos individual',
            description: 'Añadir movimiento de brazos libres mientras el paso básico continúa.',
            tips: ['Los brazos siguen el ritmo', 'Empezá con un solo brazo antes de usar los dos'],
          },
        ],
      },
      {
        level: 'avanzado',
        description: 'Velocidad, virtuosismo y lucimiento individual.',
        steps: [
          {
            id: 'mer-a-1',
            name: 'Triple vuelta del seguidor',
            description: 'Tres vueltas consecutivas a máxima velocidad del merengue.',
            tips: ['El spot es esencial', 'El impulso del líder debe ser claro y controlado'],
          },
          {
            id: 'mer-a-2',
            name: 'Paso picado',
            description: 'Variante percusiva donde los pies marcan golpes adicionales entre los tiempos.',
            tips: ['Cuatro golpes por tiempo en lugar de uno', 'Empezá muy lento con metrónomo'],
          },
          {
            id: 'mer-a-3',
            name: 'Secuencia de figuras encadenadas',
            description: 'Tres figuras distintas enlazadas sin perder el tempo ni la conexión.',
            tips: ['Cada figura debe terminar limpia antes de empezar la siguiente', 'La transición es parte del baile'],
          },
          {
            id: 'mer-a-4',
            name: 'Shines de merengue',
            description: 'Trabajo individual de pies y brazos en estilo propio mientras la pareja observa.',
            tips: ['Usá los 8 tiempos para completar una frase', 'Mirá a tu pareja aunque bailes solo'],
          },
          {
            id: 'mer-a-5',
            name: 'Musicalidad: responder a los metales',
            description: 'Adaptar el estilo y la energía del baile a los momentos de los trombones y trompetas.',
            tips: ['Los metales en forte piden más presencia', 'Los fills del tambora son momentos de shine'],
          },
        ],
      },
    ],
  },
  {
    id: 'cumbia',
    name: 'Cumbia',
    emoji: '🌽',
    tagline: 'El ritmo de Colombia que conquistó América',
    origin: 'Colombia',
    tempo: '80–120 BPM',
    levels: [
      {
        level: 'inicial',
        description: 'La cumbia tiene un paso balanceado y único. Aprendemos el básico y el compás.',
        steps: [
          {
            id: 'cum-i-1',
            name: 'Paso básico de cumbia',
            description: 'Paso al frente con el pie izquierdo, toque del derecho detrás y vuelta al lugar. Característico movimiento pendular.',
            tips: ['El peso va hacia adelante en el paso', 'El toque del pie de atrás es ligero', 'Compás de 4/4'],
          },
          {
            id: 'cum-i-2',
            name: 'Movimiento de caderas lateral',
            description: 'El cuerpo oscila de lado a lado con cada tiempo musical.',
            tips: ['La oscilación es natural, nace de los pies', 'No exageres al principio'],
          },
          {
            id: 'cum-i-3',
            name: 'Posición de pareja cumbia',
            description: 'Agarre tradicional: el hombre toma la mano de la mujer y la otra mano queda libre.',
            tips: ['La distancia entre parejas es mayor que en bachata', 'Postura erguida y orgullosa'],
          },
          {
            id: 'cum-i-4',
            name: 'Vuelta básica',
            description: 'El líder eleva el brazo y el seguidor da una vuelta completa en 4 tiempos.',
            tips: ['La vuelta es fluida, no brusca', 'El líder mantiene el paso durante la vuelta'],
          },
          {
            id: 'cum-i-5',
            name: 'Desplazamiento en círculo',
            description: 'Los dos caminan lentamente en círculo mientras mantienen el paso básico.',
            tips: ['Ideal para practicar la conexión', 'El círculo puede ir en ambas direcciones'],
          },
        ],
      },
      {
        level: 'intermedio',
        description: 'Añadimos figuras, cambios de posición y conexión con la música.',
        steps: [
          {
            id: 'cum-m-1',
            name: 'Figura del pañuelo',
            description: 'El líder trabaja con el pañuelo mientras da vueltas alrededor del seguidor.',
            tips: ['El pañuelo es seña de identidad de la cumbia tradicional', 'El movimiento es galante y pausado'],
          },
          {
            id: 'cum-m-2',
            name: 'Cambio de lado',
            description: 'Los dos pasan de un lado al otro durante una vuelta abierta.',
            tips: ['Cuatro tiempos para el cruce completo', 'El contacto visual es constante'],
          },
          {
            id: 'cum-m-3',
            name: 'Cargada básica',
            description: 'El seguidor se apoya en el líder en una ligera inclinación hacia atrás.',
            tips: ['El líder debe estar firme y preparado', 'La inclinación es leve, no un dip completo'],
          },
          {
            id: 'cum-m-4',
            name: 'Balanceo de cadera sincronizado',
            description: 'Los dos sincronizan el balanceo de caderas en dirección opuesta.',
            tips: ['Cuando el líder va a la derecha, el seguidor va a la izquierda', 'Crea una ilusión visual hermosa'],
          },
          {
            id: 'cum-m-5',
            name: 'Paso de palmada',
            description: 'Añadir una palmada o aplause en el tiempo 2 mientras se baila.',
            tips: ['El aplause resalta el ritmo de la caja', 'No interrumpas el paso por aplaudir'],
          },
        ],
      },
      {
        level: 'avanzado',
        description: 'Folclore, improvisación y fusión con otras variantes de la cumbia.',
        steps: [
          {
            id: 'cum-a-1',
            name: 'Cumbia moderna vs. tradicional',
            description: 'Conocer y alternar entre el estilo folclórico y la cumbia pop moderna.',
            tips: ['La tradicional tiene más trabajo de pies', 'La moderna es más estilizada y urbana'],
          },
          {
            id: 'cum-a-2',
            name: 'Secuencia de tres vueltas',
            description: 'El seguidor hace tres vueltas encadenadas sin perder el paso.',
            tips: ['Cada vuelta empieza en el tiempo 1', 'El líder guía con firmeza pero suavidad'],
          },
          {
            id: 'cum-a-3',
            name: 'Trabajo de brazos folclórico',
            description: 'Elevar y mover los brazos al estilo tradicional, coordinado con el compás.',
            tips: ['Los codos están a la altura de los hombros', 'El movimiento de brazos acompaña, no compite'],
          },
          {
            id: 'cum-a-4',
            name: 'Improvisación de shines',
            description: 'Sección libre donde cada uno improvisa su propio estilo durante 8 tiempos.',
            tips: ['Respondé a la música, no a un patrón fijo', 'Las variaciones de paso son bienvenidas'],
          },
          {
            id: 'cum-a-5',
            name: 'Musicalidad: gaita y llamador',
            description: 'Identificar los instrumentos clave (gaita, llamador, alegre) y responder a ellos.',
            tips: ['El llamador marca el tiempo base', 'El alegre hace los repiques y adornos'],
          },
        ],
      },
    ],
  },
  {
    id: 'zouk',
    name: 'Zouk',
    emoji: '🌊',
    tagline: 'Fluidez, ondas y conexión de largo alcance',
    origin: 'Brasil / Antillas',
    tempo: '70–100 BPM',
    levels: [
      {
        level: 'inicial',
        description: 'El zouk se basa en el balanceo del cuerpo y el trabajo de cabeza. Empezamos suave.',
        steps: [
          {
            id: 'zouk-i-1',
            name: 'Paso básico de zouk',
            description: 'Tres pasos (1-2-3) con un balanceo natural del cuerpo. Tiempo 4 es libre.',
            tips: ['El balanceo viene de las caderas hacia arriba', 'Los pasos son pequeños y fluidos'],
          },
          {
            id: 'zouk-i-2',
            name: 'Lateral básico',
            description: 'Desplazamiento lateral en dos tiempos, alternando derecha e izquierda.',
            tips: ['Un tiempo = un desplazamiento completo', 'Los pies se juntan en el medio'],
          },
          {
            id: 'zouk-i-3',
            name: 'Posición de pareja zouk',
            description: 'Conexión cercana: mano del líder en la espalda del seguidor a la altura del omóplato.',
            tips: ['La conexión es firme pero no rígida', 'El seguidor se deja fluir con el líder'],
          },
          {
            id: 'zouk-i-4',
            name: 'Head movement básico',
            description: 'El seguidor aprende a dejar la cabeza fluir en la dirección del movimiento.',
            tips: ['El cuello está relajado, no forzado', 'La cabeza sigue el cuerpo, no lidera'],
          },
          {
            id: 'zouk-i-5',
            name: 'Giro básico',
            description: 'Una vuelta del seguidor con el head movement incorporado.',
            tips: ['La cabeza completa la vuelta después del cuerpo', 'El líder guía con suavidad'],
          },
        ],
      },
      {
        level: 'intermedio',
        description: 'Head movement avanzado, lateral con olas y variaciones de conexión.',
        steps: [
          {
            id: 'zouk-m-1',
            name: 'Head roll completo',
            description: 'La cabeza del seguidor traza un círculo completo de manera fluida.',
            tips: ['Empezá sin pareja para practicar la movilidad del cuello', 'El movimiento es lento y controlado'],
          },
          {
            id: 'zouk-m-2',
            name: 'Body wave en zouk',
            description: 'Ondulación del cuerpo completo coordinada con el balanceo.',
            tips: ['La ola parte de las caderas', 'Sincronizá con los tiempos pares de la música'],
          },
          {
            id: 'zouk-m-3',
            name: 'Lateral con dip',
            description: 'Al final del lateral, el seguidor se deja caer en un dip controlado.',
            tips: ['El líder anuncia el dip con la mano en la espalda', 'El seguidor debe tener el core activo'],
          },
          {
            id: 'zouk-m-4',
            name: 'Conexión de cadera a cadera',
            description: 'Los dos conectan las caderas para sincronizar el balanceo.',
            tips: ['Requiere confianza y comunicación previa con la pareja', 'El balanceo es compartido, no individual'],
          },
          {
            id: 'zouk-m-5',
            name: 'Giro con head release',
            description: 'El seguidor suelta la cabeza completamente al salir del giro.',
            tips: ['El head release se hace al final del giro, no al inicio', 'La cabeza regresa sola por inercia'],
          },
        ],
      },
      {
        level: 'avanzado',
        description: 'Acrobacia suave, musicalidad y zouk neo vs. tradicional.',
        steps: [
          {
            id: 'zouk-a-1',
            name: 'Back bend (arqueo hacia atrás)',
            description: 'El seguidor se arquea hacia atrás mientras el líder sostiene y controla el descenso.',
            tips: ['El líder sostiene con ambas manos', 'El seguidor activa el core en todo momento'],
          },
          {
            id: 'zouk-a-2',
            name: 'Viradinha',
            description: 'El seguidor gira 180° para quedar de espaldas al líder sin soltar el agarre.',
            tips: ['El giro es lento y controlado', 'El líder ajusta el agarre durante el giro'],
          },
          {
            id: 'zouk-a-3',
            name: 'Secuencia de olas con pareja',
            description: 'Los dos sincronizan body waves en oposición o en unísono.',
            tips: ['En oposición crea tensión visual', 'En unísono crea armonía visual'],
          },
          {
            id: 'zouk-a-4',
            name: 'Zouk neo: elementos de otras danzas',
            description: 'Incorporar movimientos de contemporáneo, tango o lyrical al vocabulario del zouk.',
            tips: ['La música lo pide: respondé a la emoción', 'No fuerces un estilo; dejá que fluya'],
          },
          {
            id: 'zouk-a-5',
            name: 'Improvisación musical profunda',
            description: 'Baile completamente guiado por la música: cambios de velocidad, texturas y silencios.',
            tips: ['Los silencios son igual de importantes que los movimientos', 'Escuchá la letra además del ritmo'],
          },
        ],
      },
    ],
  },
]

export const getGenreById = (id: string): Genre | undefined =>
  genres.find((g) => g.id === id)

// MVP: only these genre IDs are available. Add more as they're ready.
export const availableGenreIds: string[] = ['salsa']
