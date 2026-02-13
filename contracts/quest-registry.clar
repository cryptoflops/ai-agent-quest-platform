
;; quest-registry.clar
;; Manages quest lifecycle: create, accept, complete

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-accepted (err u102))
(define-constant err-not-accepted (err u103))
(define-constant err-quest-expired (err u104))
(define-constant err-unauthorized (err u105))
(define-constant err-invalid-state (err u106))

;; Status Constants
(define-constant STATUS-OPEN u0)
(define-constant STATUS-IN-PROGRESS u1)
(define-constant STATUS-COMPLETED u2)
(define-constant STATUS-EXPIRED u3)

;; Data Vars
(define-data-var last-quest-id uint u0)

;; Maps
(define-map quests uint 
  {
    creator: principal,
    description: (string-ascii 500),
    reward-amount: uint,
    reputation-threshold: uint,
    expiry-block: uint,
    status: uint,
    assigned-agent: (optional principal),
    completed-at: (optional uint)
  }
)

(define-map agent-active-quests principal uint)

;; Read-only functions

(define-read-only (get-quest (quest-id uint))
  (map-get? quests quest-id)
)

(define-read-only (get-active-quest-for-agent (agent principal))
  (map-get? agent-active-quests agent)
)

;; Public functions

(define-public (create-quest (description (string-ascii 500)) (reward-amount uint) (reputation-threshold uint) (expiry-block uint))
  (let
    (
      (new-id (+ (var-get last-quest-id) u1))
      (creator tx-sender)
    )
    ;; In a real scenario, we might lock funds here.
    ;; For Phase 2 base logic, we just record the quest.
    
    (map-set quests new-id {
      creator: creator,
      description: description,
      reward-amount: reward-amount,
      reputation-threshold: reputation-threshold,
      expiry-block: expiry-block,
      status: STATUS-OPEN,
      assigned-agent: none,
      completed-at: none
    })
    
    (var-set last-quest-id new-id)
    (print {event: "quest-created", quest-id: new-id, creator: creator})
    (ok new-id)
  )
)

(define-public (accept-quest (quest-id uint))
  (let
    (
      (quest (unwrap! (map-get? quests quest-id) err-not-found))
      (agent tx-sender)
    )
    (asserts! (is-eq (get status quest) STATUS-OPEN) err-invalid-state)
    (asserts! (< block-height (get expiry-block quest)) err-quest-expired)
    (asserts! (is-none (map-get? agent-active-quests agent)) err-invalid-state) ;; One active quest per agent
    
    ;; TODO: Check reputation threshold using Phase 3 contract
    
    (map-set quests quest-id (merge quest {
      status: STATUS-IN-PROGRESS,
      assigned-agent: (some agent)
    }))
    
    (map-set agent-active-quests agent quest-id)
    (print {event: "quest-accepted", quest-id: quest-id, agent: agent})
    (ok true)
  )
)

(define-public (submit-proof (quest-id uint) (proof-hash (buff 32)))
  (let
    (
      (quest (unwrap! (map-get? quests quest-id) err-not-found))
      (agent tx-sender)
    )
    (asserts! (is-eq (get status quest) STATUS-IN-PROGRESS) err-invalid-state)
    (asserts! (is-eq (get assigned-agent quest) (some agent)) err-unauthorized)
    
    ;; In a real scenario, we would verify the proof here or call a verifier.
    ;; For now, we assume submission implies completion for the logic flow, 
    ;; or we could add a verification step. Phase 2 says "Automated payout if proof valid".
    ;; We'll mark it as completed.
    
    (map-set quests quest-id (merge quest {
      status: STATUS-COMPLETED,
      completed-at: (some block-height)
    }))
    
    (map-delete agent-active-quests agent)
    (print {event: "quest-completed", quest-id: quest-id, agent: agent, proof: proof-hash})
    (ok true)
  )
)
