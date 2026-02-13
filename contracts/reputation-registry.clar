
;; reputation-registry.clar
;; Implements on-chain reputation tracking inspired by ERC-8004

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-authorized (err u101))
(define-constant err-invalid-score (err u102))

;; Data Maps
(define-map agent-reputation principal
  {
    total-score: uint,
    total-quests: uint,
    last-updated: uint
  }
)

(define-map feedback-history 
  { agent: principal, quest-id: uint }
  {
    score: uint, ;; 1-5
    comment: (string-ascii 140),
    timestamp: uint
  }
)

;; Public functions

(define-public (add-reputation (agent principal) (quest-id uint) (score uint))
  (let
    (
      (current-data (default-to { total-score: u0, total-quests: u0, last-updated: u0 } (map-get? agent-reputation agent)))
    )
    ;; In a real implementation, we would check if tx-sender is the quest creator
    ;; and if the quest is actually completed.
    ;; For this phase, we assume the caller is authorized (or the contract caller).
    
    (asserts! (and (>= score u1) (<= score u5)) err-invalid-score)
    
    (map-set agent-reputation agent {
      total-score: (+ (get total-score current-data) score),
      total-quests: (+ (get total-quests current-data) u1),
      last-updated: block-height
    })
    
    (map-set feedback-history { agent: agent, quest-id: quest-id } {
      score: score,
      comment: "Automated feedback",
      timestamp: block-height
    })
    
    (print {event: "reputation-updated", agent: agent, new-score: score})
    (ok true)
  )
)

(define-read-only (get-reputation (agent principal))
  (default-to { total-score: u0, total-quests: u0, last-updated: u0 } (map-get? agent-reputation agent))
)
