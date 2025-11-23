import './Tournament.css'
import { Restaurant } from './RestaurantVWorldMap'
import { useState, useEffect } from 'react'
import { CloseIcon } from '@/assets/CloseIcon'
import { TriangleLeftIcon, TriangleRightIcon } from '../../../assets/TrianlgeIcon'
import ImageSkeleton from '../common/ImageSkeleton'
import NoImageIcon from '@/assets/no-image.png'
import RestaurantImageSlider from '../common/RestaurantImageSlider'


interface TournamentProps {
  restaurants: Restaurant[]
  onRemoveRestaurant: (restaurantId: number) => void
  onCloseTournament: () => void
}

const Tournament: React.FC<TournamentProps> = ({
  restaurants,
  onRemoveRestaurant,
  onCloseTournament,
}) => {
  // 현재 라운드 참가자들
  const [currentRoundParticipants, setCurrentRoundParticipants] = useState<Restaurant[]>([])
  // 현재 라운드에서 몇 번째 매치인지 (0부터 시작)
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0)
  // 다음 라운드로 진출할 승자들
  const [nextRoundWinners, setNextRoundWinners] = useState<Restaurant[]>([])
  // 최종 승자
  const [winner, setWinner] = useState<Restaurant | null>(null)
  const [isFinished, setIsFinished] = useState<boolean>(false)
  const [isClosing, setIsClosing] = useState<boolean>(false)

  // 2의 제곱수 중 n 이상인 가장 작은 수 찾기
  const getNextPowerOfTwo = (n: number): number => {
    let power = 1
    while (power < n) {
      power *= 2
    }
    return power
  }

  // 토너먼트 초기화
  useEffect(() => {
    const survivedRestaurants = restaurants.filter(restaurant => restaurant.survived)

    const shuffledRestaurants = survivedRestaurants.sort(() => Math.random() - 0.5)
    setCurrentRoundParticipants(shuffledRestaurants)
    setCurrentMatchIndex(0)
    setNextRoundWinners([])
  }, [])

  const closeTournament = (e: React.AnimationEvent) => {
    if (e.target === e.currentTarget && isClosing) {
      onCloseTournament()
    }
  }

  const win = (selectedWinner: Restaurant) => {
    // 현재 매치의 두 참가자
    const match1 = currentRoundParticipants[currentMatchIndex * 2]
    const match2 = currentRoundParticipants[currentMatchIndex * 2 + 1]

    if (!match1 || !match2) return

    // 패자 제거
    const loser = match1.id === selectedWinner.id ? match2 : match1
    onRemoveRestaurant(loser.id)

    // 승자를 다음 라운드 리스트에 추가
    const updatedWinners = [...nextRoundWinners, selectedWinner]
    setNextRoundWinners(updatedWinners)

    // 현재 라운드의 실제 경기 수 (부전승 제외)
    const totalMatchesInRound = Math.floor(currentRoundParticipants.length / 2)
    const isLastMatchInRound = currentMatchIndex + 1 >= totalMatchesInRound

    if (isLastMatchInRound) {
      // 홀수인 경우 마지막 한 명은 부전승 (자동 진출)
      const byePlayer = currentRoundParticipants.length % 2 === 1
        ? currentRoundParticipants[currentRoundParticipants.length - 1]
        : null

      const allWinners = byePlayer ? [...updatedWinners, byePlayer] : updatedWinners

      // 라운드 종료
      if (allWinners.length === 1) {
        // 토너먼트 종료
        setWinner(allWinners[0])
        setIsFinished(true)
      } else {
        // 다음 라운드 시작
        setCurrentRoundParticipants(allWinners)
        setCurrentMatchIndex(0)
        setNextRoundWinners([])
      }
    } else {
      // 현재 라운드의 다음 매치로
      setCurrentMatchIndex(currentMatchIndex + 1)
    }
  }

  // 현재 매치 정보
  const currentMatch: [Restaurant, Restaurant] | null =
    currentRoundParticipants.length > 0 &&
      currentMatchIndex * 2 + 1 < currentRoundParticipants.length
      ? [
        currentRoundParticipants[currentMatchIndex * 2],
        currentRoundParticipants[currentMatchIndex * 2 + 1]
      ]
      : null

  // 라운드 정보
  const actualParticipants = currentRoundParticipants.length
  const roundSize = getNextPowerOfTwo(actualParticipants) // 8강, 16강 등
  const currentMatchNumber = currentMatchIndex + 1
  const totalMatchesInRound = Math.floor(actualParticipants / 2)
  const roundName = roundSize === 2 ? '결승' : `${roundSize}강`
  const hasByePlayer = actualParticipants % 2 === 1

  return (
    <div
      className={`tournament-container ${isClosing ? 'closed' : ''}`}
      onAnimationEnd={closeTournament}
    >
      {/* 토너먼트 진행 중 */}
      {!isFinished && currentMatch && currentMatch[0] && currentMatch[1] && (
        <>
          <div className="close-btn-wrap">
            <div className="close-btn" onClick={() => {
              console.log('Close button clicked, setting isClosing to true')
              setIsClosing(true)
            }}>
              <CloseIcon
                className="close-icon"
                width={44}
                height={44}
              />
            </div>
          </div>

          <div className="tournament-header">
            <h1>🏆 점심 월드컵 {roundName} 🏆</h1>
            <h2 className="tournament-remaining">
              {currentMatchNumber}/{totalMatchesInRound} 경기
              {hasByePlayer && <span> (부전승 1개)</span>}
            </h2>
          </div>

          <div className="tournament-body">

            <div className="tournament-card">
              <div className="tc-content">

                <h1>{currentMatch[0].name}</h1>

                <div className="tc-image-slider">
                  {currentMatch[0].images.length > 0 ? (
                    <RestaurantImageSlider
                      images={currentMatch[0].images}
                      restaurantName={currentMatch[0].name}
                      mode="single"
                      imageWidth={300}
                      imageHeight={300}
                      imagesPerView={1}
                    />
                  ) : (
                    <ImageSkeleton
                      src={NoImageIcon}
                      alt="이미지 없음"
                      width={300}
                      height={300} />
                  )}
                </div>

                <button
                  className="tc-vote-btn"
                  onClick={() => win(currentMatch[0])}>
                  진출
                </button>

              </div>
            </div>

            <div className="tournament-vs">VS</div>

            <div className="tournament-card">
              <div className="tc-content">

                <h1>{currentMatch[1].name}</h1>

                <div className="tc-image-slider">
                  {currentMatch[1].images.length > 0 ? (
                    <RestaurantImageSlider
                      images={currentMatch[1].images}
                      restaurantName={currentMatch[1].name}
                      mode="single"
                      imageWidth={300}
                      imageHeight={300}
                      imagesPerView={1}
                    />
                  ) : (
                    <ImageSkeleton
                      src={NoImageIcon}
                      alt="이미지 없음"
                      width={300}
                      height={300}
                    />
                  )}
                </div>

                <button
                  className="tc-vote-btn"
                  onClick={() => win(currentMatch[1])}>
                  진출
                </button>


              </div>
            </div>
          </div>
        </>
      )}

      {/* 토너먼트 완료 */}
      {isFinished && winner && (
        <>
          <div className="close-btn-wrap">
            <div className="close-btn" onClick={() => setIsClosing(true)}>
              <CloseIcon
                className="close-icon"
                width={44}
                height={44}
              />
            </div>
          </div>

          <div className="tournament-header">
            <div className="tournament-winner">
              <h1>우승자: {winner.name}</h1>
            </div>
          </div>

          <div className="tournament-card">
            <div className="tc-content">

              <div className="tc-image-slider">
                {winner.images.length > 0 ? (
                  <RestaurantImageSlider
                    images={winner.images}
                    restaurantName={winner.name}
                    mode="single"
                    imageWidth={300}
                    imageHeight={300}
                    imagesPerView={1}
                  />
                ) : (
                  <ImageSkeleton
                    src={NoImageIcon}
                    alt="이미지 없음"
                    width={300}
                    height={300} />
                )}
              </div>
            </div>
          </div>

          <button
            className="tc-exit-btn"
            onClick={() => setIsClosing(true)}
          >
            완료
          </button>
        </>
      )}
    </div>
  )
}

export default Tournament