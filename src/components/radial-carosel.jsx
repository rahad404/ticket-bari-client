'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import {
   Carousel,
   CarouselNext,
   CarouselPrevious,
} from '@/components/ui/carousel'

const Images = [
   {
      image: 'https://grandsylhet.com/wp-content/uploads/2025/01/Jaflong-Beauty-1024x538.webp',
      title: "Sylhet – Buy Bus Tickets for Sylhet and Other Destinations",
      category: 'Buy Bus Tickets',
   },
   {
      image: 'https://www.tbsnews.net/sites/default/files/styles/infograph/public/images/2023/11/06/01_view_32_1_0.jpg',
      title: "Cox's Bazar – Buy Train Tickets for Cox's Bazar and Other Destinations",
      category: 'Buy Train Tickets',
   },
   {
      image: 'https://thumbs.dreamstime.com/b/launch-bangladesh-sadar-ghat-launch-bangladesh-sadar-ghat-233454714.jpg',
      title: 'River Launch – Buy Launch Tickets for River Cruises',
      category: 'Buy Launch Tickets',
   },
   {
      image: 'https://c8.alamy.com/zooms/9/b8c519652be0477b9036c6b2b4a18356/2gm43jx.jpg',
      title: 'BD Airline – Buy Plane Tickets for Domestic and International Flights',
      category: 'Buy Launch Tickets',
   },
]


/* tuned sizes */
const R = 220
const THETA = 32
const AUTOPLAY_DELAY = 3000

const CARD_W = 320
const CARD_H = 420

const SPRING = {
   type: 'spring',
   stiffness: 280,
   damping: 26,
   mass: 0.85,
}

function arcStyle(offset) {
   const rad = (offset * THETA * Math.PI) / 180
   const abs = Math.abs(offset)

   return {
      x: R * Math.sin(rad),
      rotateY: -offset * THETA,

      scale: Math.max(0.7, 1 - abs * 0.15),

      opacity:
         abs > 2 ? 0 : Math.max(0.25, 1 - abs * 0.35),

      zIndex: 10 - abs,
   }
}

const RadialCarousel = () => {
   const total = Images.length
   const [active, setActive] = React.useState(0)
   const timerRef = React.useRef(null)

   const shiftIndex = React.useCallback(
      dir => {
         setActive(i => (i + dir + total) % total)
      },
      [total]
   )

   const restartTimer = React.useCallback(() => {
      if (timerRef.current) clearInterval(timerRef.current)

      timerRef.current = setInterval(() => {
         shiftIndex(1)
      }, AUTOPLAY_DELAY)
   }, [shiftIndex])

   const handleInteraction = React.useCallback(
      action => {
         action()
         restartTimer()
      },
      [restartTimer]
   )

   React.useEffect(() => {
      restartTimer()

      return () => {
         if (timerRef.current) clearInterval(timerRef.current)
      }
   }, [restartTimer])

   React.useEffect(() => {
      const handler = e => {
         if (e.key === 'ArrowLeft')
            handleInteraction(() => shiftIndex(-1))

         if (e.key === 'ArrowRight')
            handleInteraction(() => shiftIndex(1))
      }

      window.addEventListener('keydown', handler)

      return () =>
         window.removeEventListener('keydown', handler)
   }, [handleInteraction, shiftIndex])

   return (
      <Carousel className="flex w-full flex-col items-center gap-8 py-6 select-none">
         {/* taller wrapper prevents clipping */}
         <div className="relative h-[400px] w-full overflow-visible">
            {Images.map((slide, i) => {
               const raw = (i - active + total) % total
               const offset =
                  raw > total / 2 ? raw - total : raw

               const {
                  x,
                  rotateY,
                  scale,
                  opacity,
                  zIndex,
               } = arcStyle(offset)

               return (
                  <motion.div
                     key={i}
                     className="absolute top-0 left-1/2 cursor-pointer"
                     style={{
                        width: CARD_W,
                        height: CARD_H,
                        marginLeft: -(CARD_W / 2.5),
                        zIndex,
                     }}
                     animate={{
                        x,
                        rotateY,
                        scale,
                        opacity,
                     }}
                     transition={SPRING}
                     onClick={() =>
                        handleInteraction(() =>
                           setActive(i)
                        )
                     }
                  >
                     <div className="relative h-full w-full overflow-hidden rounded-3xl border bg-background shadow-xl">
                        <img
                           src={slide.image}
                           alt={slide.title}
                           className="h-full w-full object-cover"
                           draggable={false}
                        />

                        {/* overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                        {/* title */}
                        <motion.div
                           className="absolute inset-x-0 bottom-0 px-5 pb-6"
                           animate={{
                              opacity: offset === 0 ? 1 : 0,
                              y: offset === 0 ? 0 : 12,
                           }}
                           transition={{ duration: 0.25 }}
                        >
                           <p className="text-white text-base font-semibold leading-snug">
                              {slide.title}
                           </p>
                        </motion.div>
                     </div>
                  </motion.div>
               )
            })}
         </div>

         {/* <div className="flex items-center gap-3">
        <CarouselPrevious
          className="static translate-y-0"
          onClick={() =>
            handleInteraction(() =>
              shiftIndex(-1)
            )
          }
        />

        <CarouselNext
          className="static translate-y-0"
          onClick={() =>
            handleInteraction(() =>
              shiftIndex(1)
            )
          }
        />
      </div> */}
      </Carousel>
   )
}

export default RadialCarousel