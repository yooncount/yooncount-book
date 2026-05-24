import React, { forwardRef, useEffect, useState } from 'react'
import { formatKoreanAmount, formatWithCommas } from '../../utils/format'

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number | string | null
  onChange?: (value: number | undefined) => void
  /** 보조 한글 라벨 표시 여부 (기본 true) */
  showKorean?: boolean
}

/**
 * 금액 입력 컴포넌트.
 * - 입력 시 자동으로 천 단위 콤마 표시
 * - 값이 있을 때 아래에 한글 환산 라벨 (예: 3백만원)
 * - react-hook-form의 Controller render={({field}) => <AmountInput {...field} />} 형태로 사용
 */
const AmountInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, showKorean = true, className = '', ...rest }, ref) => {
    const [display, setDisplay] = useState('')

    useEffect(() => {
      if (value === undefined || value === null || value === '') {
        setDisplay('')
      } else {
        setDisplay(formatWithCommas(value))
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^0-9]/g, '')
      if (raw === '') {
        setDisplay('')
        onChange?.(undefined)
        return
      }
      const num = Number(raw)
      setDisplay(formatWithCommas(num))
      onChange?.(num)
    }

    const korean = showKorean ? formatKoreanAmount(display) : ''

    return (
      <div>
        <input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={display}
          onChange={handleChange}
          className={
            className ||
            'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-right'
          }
          {...rest}
        />
        {korean && (
          <p className="text-xs text-gray-400 mt-1 text-right">{korean}</p>
        )}
      </div>
    )
  },
)

AmountInput.displayName = 'AmountInput'

export default AmountInput
