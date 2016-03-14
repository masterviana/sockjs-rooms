## sockjs-rooms

Allow you to create a small pub/sub system

sockjs-rooms is a libray on top of SOCKJS that allow you create channels (rooms) over a single over a SockJS connection the concept of room applies due to the fact that all clients registered in some channel are able to get the message sent to this channel. This creates a simple pub/sub where clients are able to subscribe some channel and once anyone send a message to a channel the server broadcast this messega to all client's registered on room (channel).

