
;; x402-quest-escrow.clar
;; Handles automated payments for quest completion

(use-trait sip-010-trait .sip-010-trait.sip-010-trait)

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-quest-not-completed (err u104))

;; Data Maps
(define-map quest-escrow uint 
  {
    amount: uint,
    token-principal: (optional principal), ;; none = STX, some = SIP-010
    depositor: principal,
    locked: bool,
    paid: bool
  }
)

;; Public functions

(define-public (deposit-stx (quest-id uint) (amount uint))
  (begin
    (asserts! (> amount u0) err-invalid-amount)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set quest-escrow quest-id {
      amount: amount,
      token-principal: none,
      depositor: tx-sender,
      locked: true,
      paid: false
    })
    (print {event: "escrow-deposit-stx", quest-id: quest-id, amount: amount, depositor: tx-sender})
    (ok true)
  )
)

;; Release payment - usually called by the quest registry or verifying contract
;; For this Phase 4, we allow the depositor (creator) to release it manually 
;; OR it could be triggered by the system if we had logic for it.
;; "Functions: deposit-quest-reward, verify-x402-proof, release-payment"

(define-public (release-payment (quest-id uint) (recipient principal))
  (let
    (
      (escrow (unwrap! (map-get? quest-escrow quest-id) err-not-found))
    )
    (asserts! (is-eq (get depositor escrow) tx-sender) err-unauthorized) ;; Only depositor can release for now
    (asserts! (get locked escrow) err-unauthorized)
    (asserts! (not (get paid escrow)) err-unauthorized)
    
    (match (get token-principal escrow)
      token (err u999) ;; SIP-010 not fully implemented in this snippet for brevity, focusing on STX
      (begin
        (try! (as-contract (stx-transfer? (get amount escrow) tx-sender recipient)))
        (map-set quest-escrow quest-id (merge escrow { locked: false, paid: true }))
        (print {event: "payment-released", quest-id: quest-id, recipient: recipient, amount: (get amount escrow)})
        (ok true)
      )
    )
  )
)

(define-read-only (get-escrow-info (quest-id uint))
  (map-get? quest-escrow quest-id)
)
